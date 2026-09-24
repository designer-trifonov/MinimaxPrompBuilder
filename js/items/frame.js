import { makeTemplateItem } from "./templateItem.js";
import { frameStore } from "../core/stores.js";

export const FrameBlockBuilder = makeTemplateItem({
  t: "frame", icon: "frame", label: "План кадра", store: frameStore, skipUnchanged: true,
  newLabel: "Новый кадр", saveLabel: "Сохранить как шаблон кадра",
  namePlaceholder: "Название (например: Крупный план)",
  textPlaceholder: "Начало описания кадра (например: close-up shot of)",
});
