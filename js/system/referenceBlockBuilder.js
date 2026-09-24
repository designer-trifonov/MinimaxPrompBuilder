import { on } from "./eventBus.js";
import { buildReferencePromptBlockView, resetReferenceCounters } from "./referencePromptBlockView.js";

// Референс — уникальный паттерн, но сам билдер этого не касается: только ловит событие и вызывает
// referencePromptBlockView ОДИН раз при создании — она сама регистрирует себя в общем списке блоков.
on("addBlockToMenu", ({ blockId, template } = {}) => {
  if (blockId !== "referenceEvent" || !template) return;
  buildReferencePromptBlockView(template);
});

on("resetAll", () => resetReferenceCounters());
