import { makeTemplateItem } from "./templateItem.js";
import { shotDescStore } from "../core/stores.js";

// Отдельно от «Плана кадра» (крупный/средний/общий план и т.д.) и отдельно от «Позы» (только тело) —
// готовые ГОТОВЫЕ (не заготовки) описания кадра целиком: камера + поза + действие одной фразой,
// например POV, где она стоит к нам лицом и мы держим её за талию. skipUnchanged: false — если
// шаблон не редактировать, он всё равно идёт в промпт (это не «начало фразы», а сразу вся фраза).
export const shotDescItem = makeTemplateItem({
  t: "shotDesc", icon: "🎬", label: "Описание кадра", store: shotDescStore, skipUnchanged: false, textRows: 3,
  newLabel: "Новое описание кадра", saveLabel: "Сохранить как описание кадра",
  namePlaceholder: "Название (например: POV)",
  textPlaceholder: "Начало описания кадра (например: Camera: first-person point of view. We see in front of us: )",
});
