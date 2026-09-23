import { el, btn } from "../lib/dom.js";

// Форма «имя → сохранить собранное как шаблон в общее хранилище». Текст берётся из compileText().
// Используется и для персонажа, и для образа (одежда без человека).
export const saveTemplateView = ({ store, compileText, namePlaceholder, saveLabel }) => (ctx, { back }) => {
  const box = el("div", "display:flex;flex-direction:column;gap:6px;");
  const name = el("input", "width:100%;box-sizing:border-box;");
  name.placeholder = namePlaceholder;
  const preview = el("div", "opacity:.7;font-size:12px;white-space:pre-wrap;", compileText() || "(пусто — сначала добавь одежду)");
  const save = btn(saveLabel);
  save.onclick = async () => {
    const text = compileText().trim();
    if (!name.value.trim() || !text) return;
    await store.add(name.value.trim(), text);
    back();
  };
  box.append(name, preview, save);
  return box;
};
