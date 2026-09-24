import { on, emit } from "./eventBus.js";

// Ничего не шлёт, кроме результата copy/изменения текста — только ловит. Блоки сами сообщают
// о себе: "promptBlock:update" (создали/изменили) — {id, blockId, text}; "promptBlock:remove" —
// {id}; "promptBlock:reorder" (шлёт promptBlockOrderManager.js после ↑/↓/✕) — {order: [id,...]} —
// реальный порядок в общем списке, не фиксированный по типу. Держит entries, собирает.
let order = []; // порядок id, как в общем списке блоков
const entries = new Map(); // id -> { blockId, text }

function compile() {
  return order
    .map((id) => entries.get(id))
    .filter(Boolean)
    .map((e) => (e.text || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

// Синхронный доступ к уже собранному промпту — нужен точке входа ноды (promptBlocksV2.js),
// чтобы держать скрытое поле для Python в актуальном состоянии, не дожидаясь клика «Копировать».
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
    // буфер обмена недоступен (не https/не в фокусе) — молча игнорируем, как и старая система
  }
});
