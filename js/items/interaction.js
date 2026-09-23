import { el, row, textInput, textArea } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { interactionStore } from "../core/stores.js";
import { makeRef } from "../blocks/refImage.js";

// Связь референсов: готовая фраза с местами {A} и {B} («{A} wears the outfit from {B}»).
// A и B — субъекты (<Subject 1>, <Subject 2>); их можно менять и заполнять фишками.
const make = (t) => ({ t: "interaction", name: t.name, tpl: t.text, a: "<Subject 1>", b: "<Subject 2>", text: "" });

const fill = (it) => (it.tpl || "").replaceAll("{A}", (it.a || "").trim()).replaceAll("{B}", (it.b || "").trim());

// Роль B по смыслу фразы: «outfit» → одежда, «environment» → помещение, «object» → предмет.
const roleOfB = (tpl) => (/outfit/i.test(tpl) ? "outfit" : /environment/i.test(tpl) ? "environment" : /object/i.test(tpl) ? "object" : "person");

export const interactionItem = {
  t: "interaction",
  // При добавлении связи заводит недостающие референс-блоки для <Subject N> из A и B (A — человек, B — по фразе).
  onAdd(it, shot, ctx) {
    const state = ctx.getState();
    [[it.a, "person"], [it.b, roleOfB(it.tpl || "")]].forEach(([tag, noun]) => {
      const m = (tag || "").match(/<Subject (\d+)>/);
      if (m && !state.some((b) => b.type === "ref" && (b.text || "").includes(m[0]))) state.push(makeRef(Number(m[1]), noun));
    });
  },
  icon: "link",
  menu: {
    icon: "link", label: "Связь референсов",
    children: () => [
      ...templateEntries(interactionStore, {
        make,
        newLabel: "Новая связь", saveLabel: "Сохранить связь",
        namePlaceholder: "Название (например: Одеть в одежду с референса)",
        textPlaceholder: "Фраза с {A} и {B}, например: {A} wears the outfit from {B}",
      }),
      { label: "Пустой элемент", make: () => make({ name: "Связь", text: "{A} ... {B}" }) },
    ],
  },
  title: (it) => `${it.name ?? "Связь"}`,
  body: (it, ctx) => {
    const ab = row(el("span", "", "A:"), textInput(it, "a", ctx, "150px"), el("span", "", "B:"), textInput(it, "b", ctx, "150px"));
    // Итоговая фраза видна сразу и обновляется при правке A/B — именно она уйдёт в промпт.
    const preview = el("div", "font-size:12px;opacity:.85;white-space:pre-wrap;");
    const upd = () => { preview.textContent = `→ ${fill(it).trim()}`; };
    ab.addEventListener("input", upd);
    upd();
    const extra = textArea(it, ctx, 2); // дополнительные детали (по желанию), допишутся после фразы
    extra.placeholder = "Дополнительные детали (необязательно)";
    return [ab, preview, extra];
  },
  compile: (it) => [fill(it).trim(), (it.text || "").trim()].filter(Boolean).join(" "),
};
