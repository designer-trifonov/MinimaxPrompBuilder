import { textArea } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";

// Фабрика элементов шота на пользовательских шаблонах: «заголовок + окно ввода».
// Элемент = { t, name, text }; шаблон подставляет name и text, текст можно править.
// skipUnchanged — шаблон это начало фразы («close-up shot of »): если ничего не дописано, элемент в промпт не идёт.
export function makeTemplateItem({ t, icon, label, store, textRows = 2, skipUnchanged = false, ...form }) {
  const blank = () => ({ t, name: label, text: "" });
  return {
    t,
    icon, // имя из ICONS (lib/dom.js) — используется и в меню, и в заголовке строки шота (blocks/shot.js)
    menu: {
      icon, label,
      children: () => [
        ...templateEntries(store, { ...form, make: (tpl) => ({ t, name: tpl.name, text: tpl.text, base: tpl.text }) }),
        { label: "Пустой элемент", make: blank },
      ],
    },
    title: (it) => `${label}: ${it.name ?? ""}`,
    body: (it, ctx) => [textArea(it, ctx, textRows)],
    compile: (it) => {
      const text = (it.text || "").trim();
      return skipUnchanged && it.base !== undefined && text === it.base.trim() ? "" : text;
    },
  };
}
