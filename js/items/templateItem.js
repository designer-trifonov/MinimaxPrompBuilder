import { textArea } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { on } from "../system/eventBus.js";

// Фабрика элементов шота на пользовательских шаблонах: «заголовок + окно ввода».
// Элемент = { t, name, text }; шаблон подставляет name и text, текст можно править.
// skipUnchanged — шаблон это начало фразы («close-up shot of »): если ничего не дописано, элемент в промпт не идёт.
// Билдер регистрируется по своему t (camera/frame/shotDesc — разные id, разные регистрации,
// просто сгенерированные одной фабрикой, а не общий билдер на всех).
export function makeTemplateItem({ t, icon, label, store, textRows = 2, skipUnchanged = false, ...form }) {
  const builder = {
    t,
    icon, // имя из ICONS (lib/dom.js) — используется и в меню, и в заголовке строки шота (blocks/shot.js)
    build({ payload, resolve }) {
      const tpl = payload?.template;
      resolve(tpl ? { t, name: tpl.name, text: tpl.text, base: tpl.text } : { t, name: label, text: "" });
    },
    menu: {
      icon, label,
      children: () => [
        ...templateEntries(store, { ...form, emitId: t }),
        { label: "Пустой элемент", emitId: t },
      ],
    },
    title: (it) => `${label}: ${it.name ?? ""}`,
    body: (it, ctx) => [textArea(it, ctx, textRows)],
    compile: (it) => {
      const text = (it.text || "").trim();
      return skipUnchanged && it.base !== undefined && text === it.base.trim() ? "" : text;
    },
  };
  on(builder.t, builder.build);
  return builder;
}
