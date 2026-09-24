import { el } from "./dom.js";
import { THEME } from "./theme.js";

// Горизонтальная лента закладок — пилюли по всем шаблонам с bookmarked:true (см. templates.js/
// templateForm.js — звёздочка в меню «Добавить блок» → «Визуальный стиль»/«Звуки»/«Музыка»).
// Листается колесом мыши (и вертикальным, и горизонтальным — оба крутят scrollLeft, см. wheel
// ниже), клик по пилюле сразу вставляет блок — без похода в меню. Своя, не через Menu — тут нет
// навигации по страницам, просто список кликабельных пилюль.
// sources: [{ type, store }] — какие типы блоков читать и из какого templateStore (core/stores.js).
export function createBookmarkRibbon(sources, { onInsert }) {
  const wrap = el("div", "display:flex;overflow-x:auto;overflow-y:hidden;gap:6px;padding:1px 1px 4px;");
  wrap.addEventListener(
    "wheel",
    (e) => {
      if (wrap.scrollWidth <= wrap.clientWidth) return;
      e.preventDefault();
      wrap.scrollLeft += e.deltaY || e.deltaX;
    },
    { passive: false }
  );

  const render = () => {
    wrap.innerHTML = "";
    const items = sources.flatMap(({ type, store }) =>
      store.list().filter((t) => t.bookmarked).map((t) => ({ type, name: t.name, text: t.text, color: t.color || "" }))
    );
    wrap.style.display = items.length ? "flex" : "none";
    items.forEach((it) => {
      const c = it.color || THEME.accent;
      const pill = el(
        "button",
        "flex-shrink:0;cursor:pointer;border-radius:999px;white-space:nowrap;overflow:hidden;" +
        `text-overflow:ellipsis;max-width:140px;padding:5px 12px;font-size:12px;background:${c}22;border:1px solid ${c}66;color:${c};`,
        it.name || "Без названия"
      );
      pill.title = it.text;
      pill.onclick = () => onInsert({ type: it.type, text: it.text, color: it.color });
      wrap.append(pill);
    });
  };
  render();

  return { el: wrap, render };
}
