import { textArea } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { characterStore } from "../shared/characters.js";
import { makeRef } from "../blocks/refImage.js";

// Персонаж в шоте — либо готовое текстовое описание из Scene Builder (как раньше), либо просто
// ссылка на референс-картинку («Персонаж с референса №N»): не нужно уходить в отдельный пункт
// меню «Референс», чтобы завести субъекта — можно сразу в шоте. Если под этим номером ещё нет
// ref-блока, onAdd сам его заведёт (как это уже делает «Связь референсов», см. interaction.js).
const REF_COUNT = 2; // сколько быстрых пунктов «с референса №N» показывать по умолчанию

const refEntries = () =>
  Array.from({ length: REF_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      label: `Персонаж с референса №${n}`,
      make: () => ({ t: "character", name: `С референса №${n}`, text: `<Subject ${n}>`, ref: n }),
    };
  });

export const characterItem = {
  t: "character",
  menu: {
    icon: "🧑", label: "Персонаж",
    children: () => [
      ...refEntries(),
      ...templateEntries(characterStore, {
        make: (t) => ({ t: "character", name: t.name, text: t.text }),
        newLabel: "Новый персонаж (вручную)", saveLabel: "Сохранить персонажа",
        namePlaceholder: "Имя персонажа",
        textPlaceholder: "Описание персонажа (по-английски)",
      }),
      { label: "Пустой элемент", make: () => ({ t: "character", name: "Персонаж", text: "" }) },
    ],
  },
  // Заводит недостающий ref-блок <Subject N> (person, картинка), если элемент — «с референса №N».
  onAdd(it, shot, ctx) {
    if (!it.ref) return;
    const state = ctx.getState();
    const tag = `<Subject ${it.ref}>`;
    if (!state.some((b) => b.type === "ref" && (b.text || "").includes(tag))) state.push(makeRef(it.ref, "person"));
  },
  title: (it) => `🧑 Персонаж: ${it.name ?? ""}`,
  body: (it, ctx) => [textArea(it, ctx, 3)],
  compile: (it) => (it.text || "").trim(),
};
