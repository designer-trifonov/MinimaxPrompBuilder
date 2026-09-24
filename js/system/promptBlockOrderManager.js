/*
import { on, emit } from "./eventBus.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

export const container = el("div", "display:flex;flex-direction:column;gap:8px;");
const elements = new Map();

export function registerBlock(id, blockEl) {
  blockEl.dataset.promptId = id;
  elements.set(id, blockEl);
  container.append(blockEl);
  emitOrder();
}

function emitOrder() {
  emit("promptBlock:reorder", { order: [...container.children].map((c) => c.dataset.promptId) });
}

function move(id, dir) {
  const elm = elements.get(id);
  if (!elm) return;
  const sibling = dir === "up" ? elm.previousElementSibling : elm.nextElementSibling;
  if (!sibling) return;
  if (dir === "up") container.insertBefore(elm, sibling);
  else container.insertBefore(sibling, elm);
  emitOrder();
}

function remove(id) {
  elements.get(id)?.remove();
  elements.delete(id);
  emit("promptBlock:remove", { id });
  emitOrder();
}

export function clear() {
  container.innerHTML = "";
  elements.clear();
}

on("promptBlock:action", ({ id, action } = {}) => {
  if (action === "moveUp") move(id, "up");
  else if (action === "moveDown") move(id, "down");
  else if (action === "remove") remove(id);
});

on("resetAll", () => clear());

*/
