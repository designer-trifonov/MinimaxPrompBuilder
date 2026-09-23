import { el, row, small, numInput, textInput, textArea } from "../lib/dom.js";
import { groupedTemplateEntries } from "../lib/templates.js";
import { weActionStore } from "../core/stores.js";

// Кого ставим по умолчанию как «для кого действие»: есть референс-блоки → <Subject 1>, иначе — «the person».
const defaultSubject = (ctx) => {
  const state = ctx?.getState?.() ?? [];
  return state.some((b) => b.type === "ref") ? "<Subject 1>" : "the person";
};
const makeAction = (who, target = "") => ({ t: "action", from: 0, to: 1, text: "", who, target });

// Готовые заготовки темпа — по мотивам того, как реально пишут в комьюнити для видео-моделей:
// speed-качественник + amplitude (та же пара терминов, что уже в cameras.json), плюс явный глагол
// движения важнее самого слова «быстро»/«медленно» — но это уже дописывает пользователь сам.
// Это СТАРТ фразы (как «close-up shot of» у плана кадра) — жмёшь, дальше дописываешь конкретику.
const SPEEDS = [
  ["Медленно", "in slow motion, with a gentle, subtle, and steady rhythm, small amplitude — "],
  ["Средне", "at a steady, natural pace, with normal, moderate amplitude — "],
  ["Очень быстро", "at an extremely rapid, fast-paced tempo, large amplitude, quick sharp motion with motion blur, like rapid machine-gun-fast speed — "],
];

export const actionItem = {
  t: "action",
  // Два входа: действие референса (кто на видео — субъект) и действие «за нас» (POV-зритель).
  // Пока оба поля текста пустые — заполняются вручную, здесь только структура/разметка времени.
  icon: "clock",
  menu: {
    icon: "clock", label: "Действие",
    // children вызывается без ctx (Menu#draw зовёт top.items() без аргументов) — ctx доступен
    // только в make(ctx) на листе, см. Menu#row: it.make(this.ctx). defaultSubject считаем там.
    children: () => [
      { label: "Действие референса", make: (ctx) => makeAction(defaultSubject(ctx)) },
      {
        label: "Действие — мы (зритель, POV)",
        children: () => [
          ...groupedTemplateEntries(weActionStore, {
            // {target} в тексте шаблона — подставляется тегом субъекта при компиляции (см. compile),
            // а не жёстким «her», чтобы всегда было ясно, о ком речь, даже при нескольких субъектах.
            make: (t, ctx) => ({ t: "action", from: 0, to: 1, text: t.text, who: "we", target: defaultSubject(ctx) }),
            newLabel: "Новое действие (вручную)", saveLabel: "Сохранить действие",
            namePlaceholder: "Название", textPlaceholder: "Действие по-английски, {target} — тег субъекта",
          }),
          { label: "Пустой элемент", make: (ctx) => makeAction("we", defaultSubject(ctx)) },
        ],
      },
    ],
  },
  // Вызывается при добавлении в шот: начало = конец предыдущего действия (или начало шота), конец = конец шота.
  onAdd(it, shot) {
    const prev = [...shot.items].reverse().find((x) => x.t === "action");
    it.from = prev ? Number(prev.to) || 0 : Number(shot.start) || 0;
    it.to = Math.max(it.from, Number(shot.end) || it.from);
  },
  // При уменьшении длительности видео подрезает секунды до максимума.
  clamp(it, max) {
    it.to = Math.min(Number(it.to) || 0, max);
    it.from = Math.min(Number(it.from) || 0, it.to);
  },
  title: (it) => `Действие${it.who === "we" ? " (мы, POV)" : it.who ? ` (${it.who})` : ""}`,
  body: (it, ctx) => {
    const speedRow = row(el("span", "", "Темп:"));
    SPEEDS.forEach(([label, phrase]) => {
      const b = small(label);
      b.onclick = () => { it.text = phrase; ctx.rerender(); };
      speedRow.append(b);
    });
    return [
      row(el("span", "", "Кто:"), textInput(it, "who", ctx, "150px"), el("span", "", "Кого:"), textInput(it, "target", ctx, "120px")),
      row(el("span", "", "с"), numInput(it, "from", ctx), el("span", "", "по"), numInput(it, "to", ctx), el("span", "", "сек")),
      speedRow,
      textArea(it, ctx, 2),
    ];
  },
  // Секунды (с/по) нужны только внутри ноды; в промпт идёт текст (с «кто», {target} → тег из «Кого»).
  compile: (it) => {
    let text = (it.text || "").trim();
    if (!text) return "";
    if (it.target) text = text.replaceAll("{target}", it.target.trim());
    const who = (it.who || "").trim();
    // Не дублируем — шаблоны «мы» уже сами начинаются с «we see ...» готовым предложением.
    if (!who || new RegExp(`^${who}\\b`, "i").test(text)) return text;
    return `${who} ${text}`;
  },
};
