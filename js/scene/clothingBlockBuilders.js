import { CLOTH_CATEGORIES, OUTFITS_CAT } from "./clothing.js";
import { on } from "../system/eventBus.js";

// Билдеры пунктов меню «+ Добавить одежду» (scene/clothingSection.js — только рендер, без логики).

// Готовый образ целиком (шаблон из outfitStore) — payload пуст только у строки-заглушки
// «Пока пусто» (тогда resolve(null), clothesMenu.onclick сам игнорирует null).
function outfitPickBlockBuilder({ payload, resolve }) {
  if (!payload?.template) return resolve(null);
  const t = payload.template;
  resolve({ cat: OUTFITS_CAT, name: t.name, text: t.text.replace(/^\s*wearing\s+/i, ""), color: "", colorName: "" });
}
on("scene_outfit", outfitPickBlockBuilder);

// Одна вещь одежды — по билдеру на категорию (головные уборы/верх/низ/обувь), а не один на всех.
CLOTH_CATEGORIES.forEach((c) => {
  function clothPickBlockBuilder({ payload, resolve }) {
    const t = payload.template;
    resolve({ cat: c.key, name: t.name, text: t.text, color: "", colorName: "", adult: t.adult });
  }
  on(`scene_cloth_${c.key}`, clothPickBlockBuilder);
});

// Цвет вещи — «Без цвета» (payload пуст) или сохранённый цвет-шаблон.
function colorPickBlockBuilder({ payload, resolve }) {
  resolve(payload?.template ? { name: payload.template.name, text: payload.template.text } : { name: "", text: "" });
}
on("scene_color", colorPickBlockBuilder);
