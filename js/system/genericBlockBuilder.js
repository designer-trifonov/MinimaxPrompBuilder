import { on } from "./eventBus.js";
import { buildPromptBlockView } from "./promptBlockView.js";

// Один паттерн на несколько разных id — простые блоки (Визуальный стиль/Звуки/Музыка). Только
// ловит событие и вызывает promptBlockView ОДИН раз при создании — она сама регистрирует себя
// в общем списке (promptBlockOrderManager.js), билдеру больше ничего делать не нужно.
const HANDLED_IDS = ["visualStyleEvent", "soundsEvent", "musicEvent"];

on("addBlockToMenu", ({ blockId, template } = {}) => {
  if (!HANDLED_IDS.includes(blockId) || !template) return;
  buildPromptBlockView(blockId, template);
});
