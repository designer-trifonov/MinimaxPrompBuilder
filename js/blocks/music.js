import { makeTextBlock } from "./textBlock.js";
import { musicStore } from "../core/stores.js";

export const musicBlock = makeTextBlock({
  type: "music",
  icon: "🎵",
  label: "Музыка",
  title: "non_diegetic_music",
  tail: true,
  fallback: "N/A",
  templates: {
    store: musicStore,
    newLabel: "Новая музыка",
    saveLabel: "Сохранить как музыку",
    namePlaceholder: "Название (например: Лофи)",
    textPlaceholder: "Описание музыки: инструменты, темп, динамика (уйдёт в промпт как есть)",
  },
});
