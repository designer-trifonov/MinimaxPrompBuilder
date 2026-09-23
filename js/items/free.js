import { textArea } from "../lib/dom.js";

export const freeItem = {
  t: "free",
  menu: { icon: "✏️", label: "Свободный текст", make: () => ({ t: "free", text: "" }) },
  title: () => "✏️ Свободный текст",
  body: (it, ctx) => [textArea(it, ctx, 2)],
  compile: (it) => (it.text || "").trim(),
};
