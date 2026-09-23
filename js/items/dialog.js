import { el, row, textInput, textArea } from "../lib/dom.js";
import { groupedTemplateEntries } from "../lib/templates.js";
import { dialogStore } from "../core/stores.js";

// Английский вариант убрали — язык всегда русский, отдельного переключателя нет.
const LANG = "Russian";

// Диалог = шаблон (манера речи/звук, сгруппировано по категориям: Интонация / Звуки) → реплика.
const blank = () => ({ t: "dialog", lang: LANG, spk: "S1", voice: "", text: "" });

export const dialogItem = {
  t: "dialog",
  icon: "chat",
  menu: {
    icon: "chat", label: "Диалог",
    children: () => [
      ...groupedTemplateEntries(dialogStore, {
        make: (tpl) => ({ t: "dialog", lang: LANG, spk: "S1", voice: tpl.text, text: "" }),
        newLabel: "Новый шаблон", saveLabel: "Сохранить как шаблон",
        namePlaceholder: "Название (например: Шепчет)",
        textPlaceholder: "Манера речи/звук (например: in a soft whisper)",
      }),
      { label: "Пустой диалог", make: blank },
    ],
  },
  title: (it) => `Диалог`,
  body: (it, ctx) => [
    row(el("span", "", "Говорящий:"), textInput(it, "spk", ctx)),
    row(el("span", "", "Манера:"), textInput(it, "voice", ctx, "100%")),
    textArea(it, ctx, 2),
  ],
  compile: (it) => {
    const txt = (it.text || "").trim();
    if (!txt) return "";
    const voice = (it.voice || "").trim();
    return `(${it.spk || "S1"}) says${voice ? " " + voice : ""}: <d>[${it.lang}] ${txt}</d>`;
  },
};
