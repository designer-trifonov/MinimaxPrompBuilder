import { makeTextBlock } from "./textBlock.js";
import { soundStore } from "../core/stores.js";
import { CARD_COLORS } from "../lib/dom.js";

export const SoundBlockBuilder = makeTextBlock({
  type: "sound",
  icon: "speaker",
  label: "Звуки",
  title: "overall_soundscape",
  color: CARD_COLORS.sound,
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
