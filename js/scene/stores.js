import { createStore } from "../lib/templateStore.js";
import { userFileBackend } from "../lib/serverBackend.js";

// Пользовательские шаблоны Scene Builder: user/<пользователь>/PromptBlocks/scene_*.json
const make = (name) => {
  const store = createStore(userFileBackend(`PromptBlocks/scene_${name}.json`));
  store.load();
  return store;
};

export const attrStores = {
  build: make("builds"),
  height: make("heights"),
  hair_style: make("hair_styles"),
  hair_color: make("hair_colors"),
  eyes: make("eyes"),
  skin: make("skins"),
  pose: make("poses"),
};

export const clothStores = {
  underwear: make("cloth_underwear"),
  legwear: make("cloth_legwear"),
  top: make("cloth_top"),
  bottom: make("cloth_bottom"),
  dress: make("cloth_dress"),
  shoes: make("cloth_shoes"),
  outer: make("cloth_outer"),
  head: make("cloth_head"),
};

export const colorStore = make("colors");

// Общее хранилище из нескольких файлов: список — объединённый, новые записи идут в основной (первый),
// правка и удаление — в тот файл, которому принадлежит запись. adultFrom — источники, чьи записи всегда 18+.
const groupStore = (stores, adultFrom = []) => {
  const owner = (id) => stores.find((s) => s.list().some((t) => t.id === id)) ?? stores[0];
  return {
    load: () => Promise.all(stores.map((s) => s.load())),
    list: () => stores.flatMap((s) => s.list().map((t) => (adultFrom.includes(s) ? { ...t, adult: "18+" } : t))),
    add: (name, text, extra) => stores[0].add(name, text, extra),
    update: (id, patch) => owner(id).update(id, patch),
    remove: (id) => owner(id).remove(id),
  };
};

// Крупные группы одежды для меню (старые файлы по категориям остаются как есть).
export const clothGroupStores = {
  head: clothStores.head,
  upper: groupStore([clothStores.top, clothStores.outer, clothStores.dress]),
  lower: groupStore([clothStores.bottom, clothStores.legwear, clothStores.underwear], [clothStores.underwear]),
  shoes: clothStores.shoes,
};
