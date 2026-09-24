import { on } from "./eventBus.js";
import { buildShotPromptBlockView } from "./shotPromptBlockView.js";

// Шот — уникальный паттерн, но сам билдер этого не касается: только ловит событие и вызывает
// shotPromptBlockView ОДИН раз при создании — она сама регистрирует себя в общем списке блоков.
on("addBlockToMenu", ({ blockId, template } = {}) => {
  if (blockId !== "shotEvent") return;
  buildShotPromptBlockView(template);
});
