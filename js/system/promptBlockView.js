import { el } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit } from "./eventBus.js";
import { buildBlockCardShell } from "./blockCardShell.js";
import { registerBlock } from "./promptBlockOrderManager.js";

// Простые блоки (Визуальный стиль/Звуки/Музыка) — сам рисует свою карточку (общая база — заголовок
// + ↑/↓/✕ — из blockCardShell.js, уникальная часть — иконка+текст) и сам шлёт promptBlock:update
// в компилятор. Билдер (genericBlockBuilder.js) вызывает это ОДИН раз при создании и больше про
// блок не думает — дальше блок живёт сам, регистрируясь в общем списке (promptBlockOrderManager.js).
const COLOR_KEY = { visualStyleEvent: "style", soundsEvent: "sound", musicEvent: "music" };
const TITLE = { visualStyleEvent: "Визуальный стиль", soundsEvent: "Звуки", musicEvent: "Музыка" };
let instanceCount = 0;

export function buildPromptBlockView(blockId, template) {
  const id = `${blockId}_${++instanceCount}`;
  const color = THEME.category[COLOR_KEY[blockId]] || THEME.stripeFallback;
  const content = el("div", "display:flex;align-items:center;gap:8px;min-width:0;");
  emit("icon:get", { id: blockId, size: 15, color, resolve: (iconEl) => content.append(iconEl) });
  const text = template.text ?? template.name ?? "";
  content.append(el(
    "span",
    "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
    text
  ));

  // Текст статичный (менять здесь нечего) — одно обновление сразу при создании достаточно.
  emit("promptBlock:update", { id, blockId, text });

  registerBlock(id, buildBlockCardShell(id, TITLE[blockId] ?? blockId, color, content));
}
