import { makeTextBlock } from "./textBlock.js";

// Только для модели image-to-video: сообщает, что загруженная картинка — кадр на 0.00 с.
// Официальная вводная строка MiniMax H3; идёт в самое начало промпта, текст можно дописывать.
export const ImageRefBlockBuilder = makeTextBlock({
  type: "i2v",
  icon: "📎",
  label: "Первый кадр (image-to-video)",
  uiTitle: "Картинка как первый кадр",
  title: "Image Reference",
  head: true,
  group: "ref",
  raw: true,
  defaultText: () =>
    "For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.",
});
