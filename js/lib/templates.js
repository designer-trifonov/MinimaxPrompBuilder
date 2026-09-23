import { templateForm } from "./templateForm.js";

// Пункты меню для пользовательских шаблонов: сохранённые (с удалением) + «создать новый».
// filter(template) — необязательный фильтр (например, по полу или возрасту).
// make(template) — превращает шаблон {id, name, text} в объект блока/элемента.
export function templateEntries(store, { make, newLabel, saveLabel, namePlaceholder, textPlaceholder, fields, filter = () => true }) {
  const form = { saveLabel, namePlaceholder, textPlaceholder, fields };
  return [
    ...store.list().filter(filter).map((t) => ({
      label: t.name,
      make: (ctx) => make(t, ctx),
      edit: templateForm(store, form, t), // ✏️ — та же форма, но с готовыми значениями
      onDelete: () => store.remove(t.id),
    })),
    { icon: "plus", label: newLabel, view: templateForm(store, form) },
  ];
}

// То же самое, но с делением на категории (поле t.category у шаблона) — подменю по категориям,
// чтобы не листать один длинный плоский список (например, позы: «у окна», «на кровати», «на полу»...).
// У кого category не задана — попадают в общую группу «Другое». «Новый» — всегда сверху, вне категорий.
export function groupedTemplateEntries(store, { make, newLabel, saveLabel, namePlaceholder, textPlaceholder, fields, filter = () => true }) {
  const form = { saveLabel, namePlaceholder, textPlaceholder, fields };
  const groups = {};
  const order = [];
  for (const t of store.list().filter(filter)) {
    const g = t.category || "Другое";
    if (!groups[g]) { groups[g] = []; order.push(g); }
    groups[g].push(t);
  }
  return [
    { icon: "plus", label: newLabel, view: templateForm(store, form) },
    ...order.map((g) => ({
      label: g,
      children: groups[g].map((t) => ({
        label: t.name,
        make: (ctx) => make(t, ctx),
        edit: templateForm(store, form, t),
        onDelete: () => store.remove(t.id),
      })),
    })),
  ];
}
