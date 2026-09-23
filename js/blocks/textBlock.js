import { card, textArea, truncate } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";

// Фабрика простых блоков «закреплённый заголовок + окно ввода».
// presets   — необязательное статичное дерево заготовок: [{label, children|text}]
// templates — необязательные пользовательские шаблоны: { store, newLabel, saveLabel, ... }
// tail      — блок всегда идёт в конце промпта; fallback — что писать, если блока нет или он пуст.
export function makeTextBlock({
  type, icon, label, title, presets, templates,
  tail = false, fallback = "",
  head: isHead = false,   // блок всегда в начале промпта
  raw = false,            // в промпт идёт только текст, без заголовка «Title:»
  uiTitle = title,        // подпись в интерфейсе ноды
  defaultText,            // (ctx) => начальный текст блока
  group,                  // ключ группы в меню (см. blocks/index.js)
  color,                  // цвет полоски карточки (см. CARD_COLORS в lib/dom.js)
}) {
  const make = (text = "") => () => ({ type, text });
  const toMenu = (nodes) =>
    nodes.map((n) => (n.children ? { label: n.label, children: toMenu(n.children) } : { label: n.label, make: make(n.text) }));

  let menu = { icon, label, make: (ctx) => ({ type, text: defaultText ? defaultText(ctx) : "" }) };
  if (templates) {
    menu = {
      icon, label,
      children: () => [
        // Встроенный пункт для блоков с fallback (звуки, музыка): «ничего не определено» = N/A по гайду.
        ...(fallback ? [{ label: `${fallback} (не задано)`, make: make(fallback) }] : []),
        ...templateEntries(templates.store, { ...templates, make: (t) => ({ type, text: t.text }) }),
        { label: "Пустой блок", make: make("") },
      ],
    };
  } else if (presets) {
    menu = { icon, label, children: [...toMenu(presets), { label: "Свой вариант", make: make("") }] };
  }

  return {
    type, tail, group, head: isHead, fallback: fallback && `${title}: ${fallback}`,
    menu,
    render(b, i, ctx) {
      return card(`${uiTitle}${raw ? "" : ":"}`, ctx.getState(), i, ctx, [textArea(b, ctx)], {
        sameKind: true, color, icon, summary: truncate(b.text, 28),
      });
    },
    compile: (b) => {
      const t = (b.text || "").trim();
      return t ? (raw ? t : `${title}: ${t}`) : "";
    },
  };
}
