import { makeTemplateItem } from "./templateItem.js";
import { cameraStore } from "../core/stores.js";

export const CameraBlockBuilder = makeTemplateItem({
  t: "camera", icon: "camera", label: "Камера", store: cameraStore,
  newLabel: "Новое поведение камеры", saveLabel: "Сохранить как шаблон камеры",
  namePlaceholder: "Название (например: Наезд)",
  textPlaceholder: "Описание движения камеры (например: The camera pushes in with small amplitude at slow speed.)",
});
