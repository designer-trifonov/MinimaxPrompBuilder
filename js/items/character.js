import { textArea } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { characterStore } from "../shared/characters.js";
import { makeRef } from "../blocks/refImage.js";
import { on } from "../system/eventBus.js";

// Персонаж в шоте — либо готовое текстовое описание из Scene Builder (как раньше), либо просто
// ссылка на референс-картинку («Персонаж с референса №N»): не нужно уходить в отдельный пункт
// меню «Референс», чтобы завести субъекта — можно сразу в шоте. Если под этим номером ещё нет
// ref-блока, onAdd сам его заведёт (как это уже делает «Связь референсов», см. interaction.js).
const REF_COUNT = 2; // сколько быстрых пунктов «с референса №N» показывать по умолчанию

const refEntries = () =>
  Array.from({ length: REF_COUNT }, (_, i) => {
    const n = i + 1;
    return { label: `Персонаж с референса №${n}`, emitId: "character", payload: { ref: n } };
  });

// ОДИН объект на блок «Персонаж»: build (создание при клике в меню) + отрисовка (title/body) +
// compile — всё вместе, не разбросано по файлу отдельными кусками.
export const CharacterBlockBuilder = {
  t: "character",
  icon: "person",
  menu: {
    icon: "person", label: "Персонаж",
    children: () => [
      ...refEntries(),
      ...templateEntries(characterStore, {
        emitId: "character",
        newLabel: "Новый персонаж (вручную)", saveLabel: "Сохранить персонажа",
        namePlaceholder: "Имя персонажа",
        textPlaceholder: "Описание персонажа (по-английски)",
      }),
      { label: "Пустой элемент", emitId: "character" },
    ],
  },
  // build — ловит собственный id из eventBus (см. lib/menu.js#row), сам решает, чем наполнить
  // объект, по payload с листа меню: {ref:N} — с референса, {template:t} — сохранённый шаблон,
  // ничего — пустой элемент.
  build({ payload, resolve }) {
    if (payload?.ref) return resolve({ t: "character", name: `С референса №${payload.ref}`, text: `<Subject ${payload.ref}>`, ref: payload.ref });
    if (payload?.template) return resolve({ t: "character", name: payload.template.name, text: payload.template.text });
    resolve({ t: "character", name: "Персонаж", text: "" });
  },
  // Заводит недостающий ref-блок <Subject N> (person, картинка), если элемент — «с референса №N».
  onAdd(it, shot, ctx) {
    if (!it.ref) return;
    const state = ctx.getState();
    const tag = `<Subject ${it.ref}>`;
    if (!state.some((b) => b.type === "ref" && (b.text || "").includes(tag))) state.push(makeRef(it.ref, "person"));
  },
  title: (it) => `Персонаж: ${it.name ?? ""}`,
  body: (it, ctx) => [textArea(it, ctx, 3)],
  compile: (it) => (it.text || "").trim(),
};
on(CharacterBlockBuilder.t, CharacterBlockBuilder.build);
