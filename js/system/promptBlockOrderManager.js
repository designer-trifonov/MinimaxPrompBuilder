import { el } from "../lib/dom.js";
import { on, emit } from "./eventBus.js";

// Единственное место, куда попадают ВСЕ реально созданные блоки промпта (любого типа) — общий
// список, чтобы «поднять/опустить» имело смысл между блоками разных типов сразу. Главное меню
// (mainMenuBuilder.js) рисует только статичную панель — это внутреннее содержимое рисует,
// перемещает и удаляет этот скрипт, по одному обезличенному событию "promptBlock:action".
export const container = el("div", "display:flex;flex-direction:column;gap:8px;");
const elements = new Map(); // id -> DOM-элемент блока

export function registerBlock(id, blockEl) {
  blockEl.dataset.promptId = id;
  elements.set(id, blockEl);
  container.append(blockEl);
  emitOrder();
}

// Порядок — реальный порядок в DOM (после перетаскивания/сдвига), не порядок регистрации.
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
