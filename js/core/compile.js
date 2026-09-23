import { BLOCK_LIST } from "../blocks/index.js";

// Иерархия промпта = порядок BLOCK_LIST: референсы → стиль → шоты → звуки → музыка.
// Блоки собираются в этом порядке независимо от того, как их добавили; внутри одного типа
// (например, шоты) сохраняется порядок пользователя.
//  - tail=true (звуки, музыка): один экземпляр, если нет — подставляется fallback (N/A).
//  - compileGroup(blocks, state): блок сам собирает целый раздел из всех своих экземпляров
//    (например, subject_definitions + retention_analysis у референсов).
export const rank = (b) => BLOCK_LIST.findIndex((s) => s.type === b.type);

export function compile(state) {
  const out = [];
  for (const spec of BLOCK_LIST) {
    const blocks = state.filter((b) => b.type === spec.type);
    if (spec.tail) {
      out.push({ text: (blocks[0] && spec.compile(blocks[0])) || spec.fallback, tail: true });
      continue;
    }
    if (spec.compileGroup) {
      const text = blocks.length ? spec.compileGroup(blocks, state) : "";
      if (text) out.push({ text });
      continue;
    }
    let shotNumber = 0;
    for (const b of blocks) {
      if (b.type === "shot") shotNumber++;
      const text = spec.compile(b, { shotNumber });
      if (text) out.push({ text });
    }
  }
  if (!out.some((o) => !o.tail)) return "";
  return out.map((o) => o.text).join("\n\n");
}

// Приводит старые форматы сохранённого состояния к текущему.
export function migrate(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((b) => {
    if (b.type) return b;
    return b.title === "First Frame" ? { type: "first", text: b.text || "" } : { type: "style", text: b.text || "" };
  });
}
