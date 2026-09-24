import { on, emit } from "./eventBus.js";

let order = [];
const entries = new Map();

const TAIL_FALLBACKS = [
  { prefix: "templateClickSounds", text: "overall_soundscape: N/A" },
  { prefix: "templateClickMusic", text: "non_diegetic_music: N/A" },
];

function compile() {
  const parts = order
    .map((id) => entries.get(id))
    .filter(Boolean)
    .map((e) => (e.text || "").trim())
    .filter(Boolean);

  TAIL_FALLBACKS.forEach(({ prefix, text }) => {
    const has = [...entries.values()].some((e) => e.blockId?.startsWith(prefix));
    if (!has) parts.push(text);
  });

  return parts.join("\n\n");
}

export function getPromptText() {
  return compile();
}

function announce() {
  emit("promptText:changed", { text: compile() });
}

on("promptBlock:update", ({ id, blockId, text } = {}) => {
  if (!id) return;
  entries.set(id, { blockId, text });
  announce();
});

on("promptBlock:remove", ({ id } = {}) => {
  entries.delete(id);
  announce();
});

on("promptBlock:reorder", ({ order: newOrder } = {}) => {
  order = newOrder || [];
  announce();
});

on("resetAll", () => {
  entries.clear();
  order = [];
  announce();
});

on("copy", async () => {
  try {
    await navigator.clipboard.writeText(compile());
  } catch {
  }
});
