import { clothGroupStores } from "./stores.js";

// Категории одежды в порядке меню (кроме «Готовых образов» — они идут первыми, см. clothingSection.js).
// Вещи внутри — пользовательские шаблоны. Бельё живёт в «Нижней» и помечено 18+ на уровне шаблона.
export const OUTFITS_CAT = "outfits";
export const CLOTH_CATEGORIES = [
  { key: "head", label: "Головные уборы", icon: "🎩" },
  { key: "upper", label: "Верхняя одежда", icon: "👕" },
  { key: "lower", label: "Нижняя одежда", icon: "👖" },
  { key: "shoes", label: "Обувь", icon: "👟" },
].map((c) => ({ ...c, store: clothGroupStores[c.key] }));
