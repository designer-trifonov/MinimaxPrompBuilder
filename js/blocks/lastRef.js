import { makeTextBlock } from "./textBlock.js";

// Режим «последний кадр» (L2VA): официальная вводная строка MiniMax H3.
// Время — длительность видео, номер шота — число шотов на момент добавления; всё правится в тексте.
export const LastRefBlockBuilder = makeTextBlock({
  type: "l2v",
  icon: "🏁",
  label: "Последний кадр (last-frame-to-video)",
  uiTitle: "Картинка как последний кадр",
  title: "Last Frame Reference",
  head: true,
  group: "ref",
  raw: true,
  defaultText: (ctx) => {
    const shots = Math.max(1, ctx.getState().filter((b) => b.type === "shot").length);
    return `How the reference pictures align with the target video — <Picture 1> (from [Shot ${shots}]) aligns with the ${ctx.duration().toFixed(2)}-second mark of the target video.`;
  },
});
