import { el, btn, row, head, card, numInput } from "../lib/dom.js";
import { stamp } from "../lib/time.js";
import { ITEMS, SHOT_MENU } from "../items/index.js";

const lastShotEnd = (state) => {
  const shots = state.filter((b) => b.type === "shot");
  return shots.length ? Number(shots[shots.length - 1].end) || 0 : 0;
};

// Отступ побольше между заголовком элемента шота (Действие, Диалог, Связь референсов...)
// и его полями — иначе всё читается одним слипшимся куском.
function renderItem(shot, k, ctx) {
  const it = shot.items[k];
  const spec = ITEMS[it.t];
  const box = el("div", "display:flex;flex-direction:column;gap:8px;padding-left:6px;border-left:2px solid #666;");
  box.append(head(spec.title(it), shot.items, k, ctx), ...spec.body(it, ctx));
  return box;
}

export const shotBlock = {
  type: "shot",
  menu: {
    icon: "🎬", label: "Шот",
    // Начало берётся из конца предыдущего шота, конец — длительность видео.
    make: (ctx) => {
      const d = ctx.duration();
      return { type: "shot", start: Math.min(lastShotEnd(ctx.getState()), d), end: d, items: [] };
    },
  },

  // При уменьшении длительности видео подрезает секунды шота и его элементов до максимума.
  clamp(b, max) {
    b.end = Math.min(Number(b.end) || 0, max);
    b.start = Math.min(Number(b.start) || 0, b.end);
    b.items.forEach((it) => ITEMS[it.t].clamp?.(it, max));
  },

  render(b, i, ctx) {
    // Отдельная плашка с отступом между элементами (список items), а не общий слипшийся столбик —
    // та же плашка card(), что у остальных блоков, поэтому у шота тоже есть стрелка сворачивания.
    const items = el("div", "display:flex;flex-direction:column;gap:10px;");
    b.items.forEach((_, k) => items.append(renderItem(b, k, ctx)));
    const add = btn("+ Добавить в шот");
    add.onclick = () =>
      ctx.openMenu(SHOT_MENU, (item) => {
        ITEMS[item.t].onAdd?.(item, b, ctx); // элемент может подстроиться под шот (например, секунды действия)
        b.items.push(item);
      });
    return card(`🎬 [Shot ${ctx.shotNumber(b)}]`, ctx.getState(), i, ctx, [
      row(el("span", "", "с"), numInput(b, "start", ctx), el("span", "", "по"), numInput(b, "end", ctx), el("span", "", "сек")),
      items,
      add,
    ], { sameKind: true });
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
