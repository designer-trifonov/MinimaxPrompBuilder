import { makeTextBlock } from "./textBlock.js";
import { soundStore } from "../core/stores.js";

export const soundBlock = makeTextBlock({
  type: "sound",
  icon: "🔊",
  label: "Звуки",
  title: "overall_soundscape",
  tail: true,
  fallback: "N/A",
  templates: {
    store: soundStore,
    newLabel: "Новый звук",
    saveLabel: "Сохранить как звук",
    namePlaceholder: "Название (например: Людная площадь)",
    textPlaceholder: "Описание окружения и звуков (уйдёт в промпт как есть)",
  },
});
