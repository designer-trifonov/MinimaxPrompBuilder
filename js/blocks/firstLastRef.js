import { makeTextBlock } from "./textBlock.js";

// Только для режима «первый и последний кадр» (две картинки): официальная вводная строка MiniMax H3.
// Время второй картинки по умолчанию равно длительности видео, номер шота — числу шотов на момент
// добавления. Всё это обычный текст: поправь секунды и номера, если нужно.
export const FirstLastRefBlockBuilder = makeTextBlock({
  type: "fl2v",
  icon: "📎",
  label: "Первый и последний кадр (две картинки)",
  uiTitle: "Первый и последний кадр",
  title: "First and Last Frame Reference",
  head: true,
  group: "ref",
  raw: true,
  defaultText: (ctx) => {
    const shots = Math.max(1, ctx.getState().filter((b) => b.type === "shot").length);
    return (
      "How the reference pictures align with the target video — " +
      "Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; " +
      `Picture 2 (from Shot ${shots}) aligns with the ${ctx.duration().toFixed(2)}-second mark of the target video.`
    );
  },
});
