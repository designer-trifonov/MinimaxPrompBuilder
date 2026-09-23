import { makeTextBlock } from "./textBlock.js";
import { styleStore } from "../core/stores.js";

export const styleBlock = makeTextBlock({
  type: "style",
  icon: "🎨",
  label: "Визуальный стиль",
  title: "Visual Style and Lighting",
  templates: {
    store: styleStore,
    newLabel: "Новый стиль",
    saveLabel: "Сохранить как стиль",
    namePlaceholder: "Название стиля (например: Съёмка на смартфон)",
    textPlaceholder: "Описание стиля и освещения (уйдёт в промпт как есть)",
  },
});
