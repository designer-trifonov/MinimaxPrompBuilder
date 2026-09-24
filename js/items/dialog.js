import { el, row, textInput, textArea } from "../lib/dom.js";
import { groupedTemplateEntries } from "../lib/templates.js";
import { dialogStore } from "../core/stores.js";
import { on } from "../system/eventBus.js";

// Английский вариант убрали — язык всегда русский, отдельного переключателя нет.
const LANG = "Russian";

// Диалог = шаблон (манера речи/звук, сгруппировано по категориям: Интонация / Звуки) → реплика.
export const DialogBlockBuilder = {
  t: "dialog",
  icon: "chat",
  build({ payload, resolve }) {
    const t = payload?.template;
    resolve({ t: "dialog", lang: LANG, spk: "S1", voice: t ? t.text : "", text: "" });
  },
  menu: {
    icon: "chat", label: "Диалог",
    children: () => [
      ...groupedTemplateEntries(dialogStore, {
        emitId: "dialog",
        newLabel: "Новый шаблон", saveLabel: "Сохранить как шаблон",
        namePlaceholder: "Название (например: Шепчет)",
        textPlaceholder: "Манера речи/звук (например: in a soft whisper)",
      }),
      { label: "Пустой диалог", emitId: "dialog" },
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
on(DialogBlockBuilder.t, DialogBlockBuilder.build);
