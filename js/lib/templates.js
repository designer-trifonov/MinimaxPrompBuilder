import { templateForm } from "./templateForm.js";

// Пункты меню для пользовательских шаблонов: сохранённые (с удалением) + «создать новый».
// filter(template) — необязательный фильтр (например, по полу или возрасту).
// Лист НЕ создаёт объект сам — несёт { emitId, payload:{template:t, ...extra} }; само создание
// делает билдер, подписанный на этот id в eventBus.js (on(emitId, ...)), см. lib/menu.js#row.
// colorBookmark — только у «Визуальный стиль»/«Звуки»/«Музыка» (см. textBlock.js): добавляет
// в форму выбор цвета и в каждую строку — звёздочку-закладку (для ленты закладок в promptBlocks.js).
export function templateEntries(store, { emitId, extra, newLabel, saveLabel, namePlaceholder, textPlaceholder, fields, filter = () => true, colorBookmark = false }) {
  const form = { saveLabel, namePlaceholder, textPlaceholder, fields, colorPicker: colorBookmark };
  return [
    ...store.list().filter(filter).map((t) => ({
      label: t.name,
      emitId, payload: { template: t, ...extra },
      edit: templateForm(store, form, t), // ✏️ — та же форма, но с готовыми значениями
      onDelete: () => store.remove(t.id),
      rowKind: "template", // своя высота — THEME.heights.templateRow (см. lib/menu.js#row)
      ...(colorBookmark ? {
        color: t.color || "",
        bookmarked: !!t.bookmarked,
        onToggleBookmark: () => store.update(t.id, { bookmarked: !t.bookmarked }),
      } : {}),
    })),
    { icon: "plus", label: newLabel, view: templateForm(store, form), rowKind: "new" }, // THEME.heights.newTemplate
  ];
}

// То же самое, но с делением на категории (поле t.category у шаблона) — подменю по категориям,
// чтобы не листать один длинный плоский список (например, позы: «у окна», «на кровати», «на полу»...).
// У кого category не задана — попадают в общую группу «Другое». «Новый» — всегда сверху, вне категорий.
export function groupedTemplateEntries(store, { emitId, extra, newLabel, saveLabel, namePlaceholder, textPlaceholder, fields, filter = () => true }) {
  const form = { saveLabel, namePlaceholder, textPlaceholder, fields };
  const groups = {};
  const order = [];
  for (const t of store.list().filter(filter)) {
    const g = t.category || "Другое";
    if (!groups[g]) { groups[g] = []; order.push(g); }
    groups[g].push(t);
  }
  return [
    { icon: "plus", label: newLabel, view: templateForm(store, form), rowKind: "new" },
    ...order.map((g) => ({
      label: g,
      children: groups[g].map((t) => ({
        label: t.name,
        emitId, payload: { template: t, ...extra },
        edit: templateForm(store, form, t),
        onDelete: () => store.remove(t.id),
        rowKind: "template",
      })),
    })),
  ];
}
