import { attrStores } from "./stores.js";

// ДАННЫЕ, не код: атрибуты человека. Чтобы добавить новый — допиши сюда строку и создай хранилище
// в stores.js. slot: куда попадает в фразу — "adj" (прилагательное перед «man/woman»), "hair",
// "eyes", "skin". adultOnly: набор недоступен, пока человеку нет 18.
export const ATTRIBUTES_DATA = [
  { key: "height", label: "Рост", icon: "📏", slot: "adj", newLabel: "Новый рост" },
  { key: "build", label: "Телосложение", icon: "💪", slot: "adj", adultOnly: true, newLabel: "Новое телосложение" },
  { key: "hair_style", label: "Причёска", icon: "💇", slot: "hair", newLabel: "Новая причёска" },
  { key: "hair_color", label: "Цвет волос", icon: "🎨", slot: "hair", newLabel: "Новый цвет волос" },
  { key: "eyes", label: "Глаза", icon: "👁️", slot: "eyes", newLabel: "Новый цвет глаз" },
  { key: "skin", label: "Кожа", icon: "🧴", slot: "skin", newLabel: "Новый цвет кожи" },
  { key: "pose", label: "Поза", icon: "🧍", slot: "pose", newLabel: "Новая поза", grouped: true },
].map((a) => ({ ...a, store: attrStores[a.key] }));
