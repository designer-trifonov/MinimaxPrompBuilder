import { makeTemplateItem } from "./templateItem.js";
import { shotDescStore } from "../core/stores.js";

// Отдельно от «Плана кадра» (крупный/средний/общий план и т.д.) и отдельно от «Позы» (только тело) —
// готовые ГОТОВЫЕ (не заготовки) описания сцены целиком: камера + поза + действие одной фразой,
// например POV, где она стоит к нам лицом и мы держим её за талию. skipUnchanged: false — если
// шаблон не редактировать, он всё равно идёт в промпт (это не «начало фразы», а сразу вся фраза).
// Иконка — фотокарточка (photo), не видеокамера (camera выше у items/camera.js): это не движение
// камеры, а зафиксированное описание всей сцены целиком, визуально они не должны путаться.
export const ShotDescBlockBuilder = makeTemplateItem({
  t: "shotDesc", icon: "photo", label: "Описание сцены", store: shotDescStore, skipUnchanged: false, textRows: 3,
  newLabel: "Новое описание сцены", saveLabel: "Сохранить как описание сцены",
  namePlaceholder: "Название (например: POV)",
  textPlaceholder: "Начало описания сцены (например: Camera: first-person point of view. We see in front of us: )",
});
