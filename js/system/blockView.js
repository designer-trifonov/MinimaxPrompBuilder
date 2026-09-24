/*
import { emit } from "./eventBus.js";

const BTN_CSS = "appearance:none;-webkit-appearance:none;box-sizing:border-box;padding:0 10px;height:30px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#42454f;border:1px solid rgba(255,255,255,.07);border-radius:8px;color:#dcdee3;";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

const btn = (text, css = "") => el("button", `${BTN_CSS}${css}`, text);

export function buildBlockView(entry) {
  const isBack = entry.id === "back";
  let isExpanded = false;

  const row = btn("", "display:flex;align-items:center;gap:8px;justify-content:flex-start;text-align:left;");
  row.dataset.blockId = entry.id;

  emit("icon:get", { id: entry.id, size: 14, resolve: (iconEl) => row.append(iconEl) });
  row.append(el(
    "span",
    "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
    entry.title
  ));

  if (isBack) {
    row.onclick = () => emit("backToMenu", {});
    return row;
  }

  const arrow = el("span", "opacity:.5;flex-shrink:0;", "›");
  row.append(arrow);
  row.onclick = () => {
    isExpanded = !isExpanded;
    arrow.textContent = isExpanded ? "⌄" : "›";
    emit("templateClicked", { id: entry.id, afterEl: row });
  };

  return row;
}

*/
