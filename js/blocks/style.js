import { makeTextBlock } from "./textBlock.js";
import { styleStore } from "../core/stores.js";
import { CARD_COLORS } from "../lib/dom.js";

export const StyleBlockBuilder = makeTextBlock({
  type: "style",
  icon: "style",
  label: "Визуальный стиль",
  title: "Visual Style and Lighting",
  color: CARD_COLORS.style,
  templates: {
    store: styleStore,
    newLabel: "Новый стиль",
    saveLabel: "Сохранить как стиль",
    namePlaceholder: "Название стиля (например: Съёмка на смартфон)",
    textPlaceholder: "Описание стиля и освещения (уйдёт в промпт как есть)",
  },
});
