import { el, small, row } from "../lib/dom.js";
import { templateEntries, groupedTemplateEntries } from "../lib/templates.js";
import { TEMPLATE_FIELDS, allowed } from "./rules.js";

// Строка атрибута: подпись + кнопка с выбранным значением (клик открывает список шаблонов) + сброс.
export function renderAttribute(attr, person, ctx) {
  const chosen = person.attrs[attr.key];
  const pick = small(chosen ? chosen.name : "— выбрать —");
  pick.style.flex = "1";
  const buildEntries = attr.grouped ? groupedTemplateEntries : templateEntries;
  pick.onclick = () =>
    ctx.openMenu(
      () => buildEntries(attr.store, {
        emitId: attr.key, // билдер за attr.key зарегистрирован в attributes.js (по одному на атрибут)
        filter: (t) => allowed(t, person),
        newLabel: attr.newLabel,
        saveLabel: "Сохранить шаблон",
        namePlaceholder: "Название",
        textPlaceholder: "Описание для промпта (по-английски)",
        fields: TEMPLATE_FIELDS,
      }),
      (sel) => { person.attrs[attr.key] = sel; },
    );
  const r = row(el("span", "min-width:110px;", `${attr.icon} ${attr.label}:`), pick);
  r.style.flexWrap = "nowrap";
  if (chosen) {
    const clear = small("✕");
    clear.onclick = () => { delete person.attrs[attr.key]; ctx.rerender(); };
    r.append(clear);
  }
  return r;
}
