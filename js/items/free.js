import { textArea } from "../lib/dom.js";
import { on } from "../system/eventBus.js";

export const FreeBlockBuilder = {
  t: "free",
  icon: "pencil",
  build: ({ resolve }) => resolve({ t: "free", text: "" }),
  menu: { icon: "pencil", label: "Свободный текст", emitId: "free" },
  title: () => "Свободный текст",
  body: (it, ctx) => [textArea(it, ctx, 2)],
  compile: (it) => (it.text || "").trim(),
};
on(FreeBlockBuilder.t, FreeBlockBuilder.build);
