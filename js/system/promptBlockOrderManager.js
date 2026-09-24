import { on, emit } from "./eventBus.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

export const container = el("div", "display:flex;flex-direction:column;gap:8px;");
const elements = new Map();
const data = new Map();

function announce() {
  const order = [...container.children].map((c) => c.dataset.promptId);
  emit("promptBlocks:changed", { blocks: order.map((id) => data.get(id)).filter(Boolean) });
}

export function registerBlock(id, blockEl, blockData) {
  blockEl.dataset.promptId = id;
  elements.set(id, blockEl);
  if (blockData) data.set(id, blockData);
  container.append(blockEl);
  emitOrder();
  announce();
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
  announce();
}

function remove(id) {
  elements.get(id)?.remove();
  elements.delete(id);
  data.delete(id);
  emit("promptBlock:remove", { id });
  emitOrder();
  announce();
}

export function clear() {
  container.innerHTML = "";
  elements.clear();
  data.clear();
  announce();
}

on("promptBlock:action", ({ id, action } = {}) => {
  if (action === "moveUp") move(id, "up");
  else if (action === "moveDown") move(id, "down");
  else if (action === "remove") remove(id);
});

on("resetAll", () => clear());

on("promptBlock:add", ({ id, el: blockEl, data: blockData } = {}) => {
  if (id && blockEl) registerBlock(id, blockEl, blockData);
});
