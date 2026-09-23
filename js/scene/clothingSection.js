import { el, btn, small } from "../lib/dom.js";
import { templateEntries } from "../lib/templates.js";
import { CLOTH_CATEGORIES, OUTFITS_CAT } from "./clothing.js";
import { outfitStore } from "../shared/outfits.js";
import { colorStore } from "./stores.js";
import { TEMPLATE_FIELDS, allowed } from "./rules.js";

// Меню «добавить вещь»: категории → вещи (шаблоны). Недоступное по полу/возрасту не показывается.
// Готовые образы — сохранённая ранее одежда целиком; в промпт идёт одним элементом.
const outfitsMenu = {
  icon: "✨", label: "Готовые образы",
  children: () => {
    const list = outfitStore.list();
    return list.length
      ? list.map((t) => ({
          label: t.name,
          make: () => ({ cat: OUTFITS_CAT, name: t.name, text: t.text.replace(/^\s*wearing\s+/i, ""), color: "", colorName: "" }),
          onDelete: () => outfitStore.remove(t.id),
        }))
      : [{ label: "Пока пусто — сохрани образ кнопкой «👗» ниже", make: () => null }];
  },
};

const clothesMenu = (person) => () => [
  outfitsMenu,
  ...CLOTH_CATEGORIES.map((c) => ({
    icon: c.icon,
    label: c.label,
    children: () =>
      templateEntries(c.store, {
        make: (t) => ({ cat: c.key, name: t.name, text: t.text, color: "", colorName: "", adult: t.adult }),
        filter: (t) => allowed(t, person),
        newLabel: "Новая вещь",
        saveLabel: "Сохранить как вещь",
        namePlaceholder: "Название (например: Футболка)",
        textPlaceholder: "Описание вещи для промпта (без цвета, например: t-shirt)",
        fields: TEMPLATE_FIELDS,
      }),
  })),
];

// Цвет выбирается в конце: список цветов — тоже шаблоны.
const colorMenu = () => () => [
  { label: "Без цвета", make: () => ({ name: "", text: "" }) },
  ...templateEntries(colorStore, {
    make: (t) => ({ name: t.name, text: t.text }),
    newLabel: "Новый цвет",
    saveLabel: "Сохранить как цвет",
    namePlaceholder: "Название цвета (например: Красный)",
    textPlaceholder: "Цвет для промпта (например: red)",
  }),
];

export function renderClothes(person, ctx) {
  const box = el("div", "display:flex;flex-direction:column;gap:4px;");
  box.append(el("div", "font-weight:bold;", "👕 Одежда"));
  person.clothes.forEach((item, k) => {
    const r = el("div", "display:flex;gap:4px;align-items:center;flex-wrap:wrap;");
    r.append(el("span", "flex:1;min-width:120px;", item.name));
    const del = small("✕");
    del.onclick = () => { person.clothes.splice(k, 1); ctx.rerender(); };
    if (item.cat === OUTFITS_CAT) { r.append(del); box.append(r); return; } // у образа цвет уже внутри
    const color = small(item.colorName ? `цвет: ${item.colorName}` : "цвет: —");
    color.onclick = () => ctx.openMenu(colorMenu(), (c) => { item.color = c.text; item.colorName = c.name; });
    r.append(color, del);
    box.append(r);
  });
  const add = btn("+ Добавить одежду");
  add.onclick = () => ctx.openMenu(clothesMenu(person), (item) => item && person.clothes.push(item));
  box.append(add);
  return box;
}
