import { emit, on } from "./eventBus.js";
import { buildPills } from "./pillBuilder.js";
import { getBookmarks, ready } from "./bookmarkEditor.js";
import { insertAtCursor } from "./cursorTracker.js";
import { THEME } from "./theme.js";

const BTN_H = 30;
const BTN_CSS = `appearance:none;-webkit-appearance:none;box-sizing:border-box;padding:0 10px;background:${THEME.surface.button};border:1px solid ${THEME.border.button};border-radius:8px;color:${THEME.text.button};`;

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

const btn = (text, css = "", height = BTN_H) =>
  el("button", `height:${height}px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${BTN_CSS}${css}`, text);

const iconBtn = (iconId, text, css = "") => {
  const b = btn("", `display:flex;align-items:center;justify-content:center;gap:6px;${css}`);
  emit("icon:get", { id: iconId, size: 14, resolve: (iconEl) => b.append(iconEl) });
  b.append(el("span", "", text));
  return b;
};

let currentRoot = null;

export const MainMenuBuilder = {
  init() {
    const root = el("div", "display:flex;flex-direction:column;gap:6px;");
    currentRoot = root;

    const pillsRow = el("div", "display:flex;flex-direction:column;");
    ready()?.then(() => pillsRow.append(buildPills(getBookmarks(), (template) => insertAtCursor(template.text))));

    const bar = el("div", "display:flex;gap:6px;");
    const addBtn = iconBtn("plus", "Добавить блок", "flex:2;");
    const copyBtn = iconBtn("copy", "Копировать", "flex:1;");
    const presetBtn = iconBtn("template", "Шаблон", "flex:1;");
    bar.append(addBtn, copyBtn, presetBtn);

    const resetBtn = btn("Сбросить всё", `background:${THEME.status.resetBg};border-color:${THEME.status.resetBorder};color:${THEME.status.offText};`);

    addBtn.onclick = () => emit("templateClicked", { id: "templateClickBlocks", parentEl: currentRoot });
    copyBtn.onclick = () => emit("copy", {});
    presetBtn.onclick = () => emit("template", {});
    resetBtn.onclick = () => emit("resetAll", {});

    root.append(pillsRow, bar, resetBtn);
    return { root, bar, addBtn, copyBtn, presetBtn, resetBtn, pillsRow };
  },
  clear() {
    if (currentRoot) currentRoot.innerHTML = "";
  },
};

on("showMainMenu", ({ resolve } = {}) => resolve?.(MainMenuBuilder.init()));

on("templateClicked", ({ id } = {}) => {
  if (id === "templateClickBlocks") MainMenuBuilder.clear();
});
