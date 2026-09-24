import { card, textArea, truncate } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { on } from "../system/eventBus.js";

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
  const toMenu = (nodes) =>
    nodes.map((n) => (n.children ? { label: n.label, children: toMenu(n.children) } : { label: n.label, emitId: type, payload: { text: n.text } }));

  let menu = { icon, label, emitId: type };
  if (templates) {
    menu = {
      icon, label,
      // colorBookmark: true — добавляет шаблонам свой цвет и звёздочку «в ленту закладок»
      // (templates.js/promptBlocks.js). Разворачивание списка — единый механизм для всех Block'ов
      // в меню, см. lib/menu.js (Menu#renderList) — тут ничего указывать не нужно.
      children: () => [
        // Встроенный пункт для блоков с fallback (звуки, музыка): «ничего не определено» = N/A по гайду.
        ...(fallback ? [{ label: `${fallback} (не задано)`, emitId: type, payload: { fallback } }] : []),
        ...templateEntries(templates.store, { ...templates, colorBookmark: true, emitId: type }),
        { label: "Пустой блок", emitId: type },
      ],
    };
  } else if (presets) {
    menu = { icon, label, children: [...toMenu(presets), { label: "Свой вариант", emitId: type, payload: { text: "" } }] };
  }

  const blockBuilder = {
    type, tail, group, head: isHead, fallback: fallback && `${title}: ${fallback}`,
    menu,
    // build — билдер блока для главного меню (id = type) на все варианты создания: с готовым
    // текстом (payload.text — «Свой вариант»/preset-лист), с fallback («не задано»), из шаблона
    // (payload.template), из пустого («Пустой блок») или с дефолтным текстом по ctx (прямой лист
    // без children — imageRef/lastRef/firstLastRef).
    build({ ctx, payload, resolve }) {
      if (payload?.fallback !== undefined) return resolve({ type, text: payload.fallback });
      if (payload?.template) return resolve({ type, text: payload.template.text, color: payload.template.color || "" });
      if (payload?.text !== undefined) return resolve({ type, text: payload.text });
      resolve({ type, text: defaultText ? defaultText(ctx) : "" });
    },
    render(b, i, ctx) {
      // b.color — свой цвет шаблона, из которого создан этот блок (задаётся при сохранении/
      // редактировании шаблона, см. lib/templateForm.js); нет своего — обычный цвет типа блока.
      return card(`${uiTitle}${raw ? "" : ":"}`, ctx.getState(), i, ctx, [textArea(b, ctx)], {
        sameKind: true, color: b.color || color, icon, summary: truncate(b.text, 28),
      });
    },
    compile: (b) => {
      const t = (b.text || "").trim();
      return t ? (raw ? t : `${title}: ${t}`) : "";
    },
  };
  on(type, blockBuilder.build);
  return blockBuilder;
}
