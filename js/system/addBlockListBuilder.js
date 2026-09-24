import { el } from "../lib/dom.js";
import { emit, on } from "./eventBus.js";
import { buildBlockView } from "./blockView.js";

// Ловит событие нажатия «Добавить блок» (шлёт system/mainMenuBuilder.js) и по JSON-конфигу
// (blockListConfig.json — только {id, title} на каждый пункт, включая «Назад») строит список.
// Сама отрисовка каждой строки — не его забота, это blockView.js (сам разворачивается, сам шлёт
// своё событие). Этот скрипт только грузит конфиг, вызывает blockView на каждую запись и держит
// свою зону, которую сам же может стереть.

let configPromise = null;
function loadConfig() {
  configPromise ??= fetch(new URL("./blockListConfig.json", import.meta.url)).then((r) => r.json());
  return configPromise;
}

const container = el("div", "display:flex;flex-direction:column;gap:6px;"); // своя зона — сама её и стирает

export const AddBlockListBuilder = {
  async build() {
    const config = await loadConfig();
    container.innerHTML = "";
    config.map(buildBlockView).forEach((row) => container.append(row));
    return container;
  },
  clear() {
    container.innerHTML = "";
  },
};

on("addBlock", async ({ resolve } = {}) => {
  const built = await AddBlockListBuilder.build();
  resolve?.(built);
});

// «Назад» → сами стираем свою зону (список блоков) и просим билдера главного меню перерисоваться.
on("backToMenu", () => {
  AddBlockListBuilder.clear();
  emit("showMainMenu", {});
});
