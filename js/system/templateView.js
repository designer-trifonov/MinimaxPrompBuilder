import { emit, on } from "./eventBus.js";
import { THEME } from "./theme.js";

const BTN_H = 30;
const BTN_CSS = `appearance:none;-webkit-appearance:none;box-sizing:border-box;padding:0 10px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:${THEME.surface.button};border:1px solid ${THEME.border.button};border-radius:8px;color:${THEME.text.button};`;
const FIELD_CSS = `background:${THEME.surface.input};border:1px solid ${THEME.border.input};border-radius:8px;color:${THEME.text.input};padding:6px 8px;font:inherit;box-sizing:border-box;`;

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

const btn = (text, css = "", height = BTN_H) =>
  el("button", `height:${height}px;${BTN_CSS}${css}`, text);

const ACTION_BTN_WIDTH = 22;

function buildIconBtn(iconId) {
  const b = btn("", "display:flex;align-items:center;justify-content:center;padding:0;", ACTION_BTN_WIDTH);
  b.style.width = `${ACTION_BTN_WIDTH}px`;
  emit("icon:get", { id: iconId, size: 13, resolve: (iconEl) => b.append(iconEl) });
  return b;
}

export function buildEditForm(template, close, blockId) {
  const box = el("div", "display:flex;flex-direction:column;gap:6px;padding:8px;");
  const titleInput = el("input", `width:100%;${FIELD_CSS}`);
  titleInput.value = template.name ?? "";
  const contentInput = el("textarea", `width:100%;resize:vertical;${FIELD_CSS}`);
  contentInput.rows = 3;
  contentInput.value = template.text ?? "";

  const row = el("div", "display:flex;gap:6px;");
  const saveBtn = btn("Сохранить", "flex:1;");
  const cancelBtn = btn("Отмена", "flex:1;");
  saveBtn.onclick = () => {
    emit("saveTemplate", { id: template.id, title: titleInput.value, content: contentInput.value, blockId });
    close();
  };
  cancelBtn.onclick = () => close();
  row.append(saveBtn, cancelBtn);

  box.append(titleInput, contentInput, row);
  return box;
}

export function buildTemplateView(template, blockId) {
  const row = btn("", "display:flex;align-items:center;gap:6px;justify-content:flex-start;text-align:left;");

  const color = template.color || THEME.text.title;
  emit("icon:get", { id: template.icon, size: 14, color, resolve: (iconEl) => iconEl && row.append(iconEl) });

  row.append(el(
    "span",
    `flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${color};`,
    template.name ?? template.title ?? ""
  ));

  row.onclick = () => emit("templateClicked", { id: template.id, afterEl: row, blockId });

  if (!template.category) {
    let isBookmarked = !!template.bookmarked;
    const bookmarkBtn = buildIconBtn(isBookmarked ? "bookmarkOn" : "bookmark");
    bookmarkBtn.onclick = (e) => {
      e.stopPropagation();
      isBookmarked = !isBookmarked;
      bookmarkBtn.innerHTML = "";
      emit("icon:get", { id: isBookmarked ? "bookmarkOn" : "bookmark", size: 13, resolve: (iconEl) => bookmarkBtn.append(iconEl) });
      emit("template:bookmark", { template, blockId });
    };
    row.append(bookmarkBtn);
  }

  if (!template.default) {
    const deleteBtn = buildIconBtn("delete");
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      emit("template:delete", { template });
    };

    let formEl = null;
    const editBtn = buildIconBtn("edit");
    editBtn.onclick = (e) => {
      e.stopPropagation();
      if (formEl) { formEl.remove(); formEl = null; return; }
      formEl = buildEditForm(template, () => { formEl?.remove(); formEl = null; }, blockId);
      row.after(formEl);
    };

    row.append(editBtn, deleteBtn);
  }

  return row;
}

export function buildTemplateViews(templates, blockId) {
  return templates.map((t) => buildTemplateView(t, blockId));
}

let createFormEl = null;
on("createTemplate", ({ afterEl, blockId } = {}) => {
  if (createFormEl) { createFormEl.remove(); createFormEl = null; return; }
  createFormEl = buildEditForm({ id: undefined, name: "", text: "" }, () => { createFormEl?.remove(); createFormEl = null; }, blockId);
  afterEl?.after(createFormEl);
});
