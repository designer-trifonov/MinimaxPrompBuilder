import { el, btn, row, card, numInput, small, icon, CARD_COLORS } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { stamp } from "../lib/time.js";
import { ITEMS, SHOT_MENU } from "../items/index.js";
import { on } from "../system/eventBus.js";

const lastShotEnd = (state) => {
  const shots = state.filter((b) => b.type === "shot");
  return shots.length ? Number(shots[shots.length - 1].end) || 0 : 0;
};

// Элемент шота (Действие, Диалог, Связь референсов...) — тоже сворачиваемый, как блоки верхнего
// уровня, но компактнее: свёрнутый вид — одна строка (заголовок + «›»), клик по ней открывает поля.
// it._collapsed хранит состояние между перерисовками, по умолчанию свёрнут (новые — сразу видны,
// см. onAdd в items/*.js, где ничего про _collapsed не пишут — там undefined, т.е. развёрнут при
// первом добавлении, и только при повторном открытии ноды сворачивается сам).
function renderItem(shot, k, ctx) {
  const it = shot.items[k];
  const spec = ITEMS[it.t];
  const collapsed = it._collapsed;

  const body = el("div", "display:flex;flex-direction:column;gap:8px;padding:0 10px 8px;");
  body.append(...spec.body(it, ctx));
  if (collapsed) body.style.display = "none";

  // Иконка — из spec.icon (имя в ICONS, lib/dom.js), не из текста заголовка: title() теперь
  // возвращает только текст (см. items/*.js), иконка отдельным полем — нейтрально-серая здесь
  // (в отличие от цветных иконок карточек верхнего уровня — эти строки все на одном общем фоне).
  const iconEl = spec.icon ? icon(spec.icon, { size: 13, color: THEME.text.muted }) : el("span");
  const label = el(
    "span",
    `font-size:12.5px;color:${THEME.text.itemLabel};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,
    spec.title(it)
  );
  const chevron = el("span", `font-size:12px;color:${THEME.text.mutedDim};flex-shrink:0;width:10px;text-align:center;`, collapsed ? "›" : "⌄");

  const up = small("↑"), dn = small("↓"), del = small("✕");
  [up, dn, del].forEach((x) => (x.style.cssText += "opacity:.4;font-size:10px;padding:1px 5px;"));
  const move = (d) => {
    const j = k + d;
    if (j < 0 || j >= shot.items.length) return;
    [shot.items[k], shot.items[j]] = [shot.items[j], shot.items[k]];
    ctx.rerender();
  };
  up.onclick = (e) => { e.stopPropagation(); move(-1); };
  dn.onclick = (e) => { e.stopPropagation(); move(1); };
  del.onclick = (e) => { e.stopPropagation(); shot.items.splice(k, 1); ctx.rerender(); };
  const ctl = el("div", "display:flex;gap:5px;flex-shrink:0;");
  ctl.append(up, dn, del);

  // Стрелка сворачивания — слева от иконки/названия, как и у карточек верхнего уровня (card()
  // в dom.js) — единое место для «сворачивания» по всему интерфейсу, а не то слева, то справа.
  const titleRow = el("div", "display:flex;align-items:center;gap:8px;cursor:pointer;padding:7px 10px;flex-wrap:nowrap;");
  titleRow.append(chevron, iconEl, label, ctl);
  titleRow.onclick = (e) => {
    if (e.target.closest("button")) return;
    it._collapsed = !it._collapsed;
    body.style.display = it._collapsed ? "none" : "flex";
    chevron.textContent = it._collapsed ? "›" : "⌄";
    ctx.fit();
  };

  const box = el("div", `display:flex;flex-direction:column;background:${THEME.surface.nested};border:1px solid ${THEME.border.nested};border-radius:8px;`);
  box.append(titleRow, body);
  return box;
}

export const ShotBlockBuilder = {
  type: "shot",
  menu: { icon: "photo", label: "Шот", emitId: "shot" },

  // build — билдер блока «Шот» для главного меню («+ Добавить блок»). Начало берётся из конца
  // предыдущего шота, конец — длительность видео.
  build({ ctx, resolve }) {
    const d = ctx.duration();
    resolve({ type: "shot", start: Math.min(lastShotEnd(ctx.getState()), d), end: d, items: [] });
  },

  // При уменьшении длительности видео подрезает секунды шота и его элементов до максимума.
  clamp(b, max) {
    b.end = Math.min(Number(b.end) || 0, max);
    b.start = Math.min(Number(b.start) || 0, b.end);
    b.items.forEach((it) => ITEMS[it.t].clamp?.(it, max));
  },

  render(b, i, ctx) {
    const items = el("div", "display:flex;flex-direction:column;gap:6px;");
    b.items.forEach((_, k) => items.append(renderItem(b, k, ctx)));
    const add = btn("+ Добавить в шот", `border-style:dashed;background:transparent;color:${THEME.text.faintAlt};`);
    add.onclick = () =>
      ctx.openMenu(SHOT_MENU, (item) => {
        ITEMS[item.t].onAdd?.(item, b, ctx); // элемент может подстроиться под шот (например, секунды действия)
        b.items.push(item);
      });
    return card(`[Shot ${ctx.shotNumber(b)}]`, ctx.getState(), i, ctx, [
      row(el("span", "", "с"), numInput(b, "start", ctx), el("span", "", "по"), numInput(b, "end", ctx), el("span", "", "сек")),
      items,
      add,
    ], { sameKind: true, color: CARD_COLORS.shot, icon: "photo", summary: `${b.start}–${b.end} сек` });
  },

  // В официальном формате первый шот идёт без таймстемпа.
  compile(b, { shotNumber }) {
    // Элементы шота — отдельные фразы: если фраза не заканчивается знаком препинания или </d>, ставим точку.
    const sentence = (t) => (/([.!?]|<\/d>)$/.test(t) ? t : `${t}.`);
    const body = b.items.map((it) => ITEMS[it.t].compile(it)).filter(Boolean).map(sentence).join(" ");
    if (!body) return "";
    return shotNumber === 1 ? `[Shot 1] ${body}` : `[Shot ${shotNumber}] At ${stamp(b.start)}, ${body}`;
  },
};
on(ShotBlockBuilder.type, ShotBlockBuilder.build);
