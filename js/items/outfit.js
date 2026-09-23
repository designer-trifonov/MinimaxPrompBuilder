import { el, row, textInput, textArea } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { outfitStore } from "../shared/outfits.js";

// Образ (одежда без человека) из Scene Builder, применяемый к субъекту: «<Subject 1> wearing ...».
// Кого одеваем по умолчанию: есть референс-блоки → <Subject 1>; есть одна картинка (image-to-video) →
// «the person in <Picture 1>»; иначе просто «the person». Поле можно править и заполнять фишкой.
const IMAGE_MODES = ["i2v", "l2v", "fl2v"];
const defaultSubject = (ctx) => {
  const state = ctx?.getState?.() ?? [];
  if (state.some((b) => b.type === "ref")) return "<Subject 1>";
  if (state.some((b) => IMAGE_MODES.includes(b.type))) return "the person in <Picture 1>";
  return "the person";
};
const make = (t, ctx) => ({ t: "outfit", name: t.name, who: defaultSubject(ctx), text: t.text });

export const outfitItem = {
  t: "outfit",
  menu: {
    icon: "👗", label: "Образ",
    children: () => [
      ...templateEntries(outfitStore, {
        make,
        newLabel: "Новый образ (вручную)", saveLabel: "Сохранить образ",
        namePlaceholder: "Название образа",
        textPlaceholder: "Одежда по-английски (например: wearing a red plaid shirt and a black skirt)",
      }),
      { label: "Пустой элемент", make: (ctx) => make({ name: "Образ", text: "" }, ctx) },
    ],
  },
  title: (it) => `👗 Образ: ${it.name ?? ""}`,
  body: (it, ctx) => [
    row(el("span", "", "Субъект:"), textInput(it, "who", ctx, "150px")),
    textArea(it, ctx, 2),
  ],
  compile: (it) => {
    const text = (it.text || "").trim();
    return text ? [(it.who || "").trim(), text].filter(Boolean).join(" ") : "";
  },
};
