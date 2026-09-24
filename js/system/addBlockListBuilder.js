/*
import { emit, on } from "./eventBus.js";
import { buildBlockView } from "./blockView.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

let configPromise = null;
function loadConfig() {
  configPromise ??= fetch(new URL("./templates/blocks.json", import.meta.url)).then((r) => r.json());
  return configPromise;
}

const container = el("div", "display:flex;flex-direction:column;gap:6px;");

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

on("backToMenu", () => {
  AddBlockListBuilder.clear();
  emit("showMainMenu", {});
});

*/
