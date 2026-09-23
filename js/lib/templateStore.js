// Хранилище пользовательских шаблонов: [{ id, name, text, ...доп. поля }].
// backend = { read(): Promise<array|null>, write(array): Promise<void> } — куда физически сохраняем.
export function createStore(backend) {
  let items = [];
  let loading = null;

  const load = () =>
    (loading ??= (async () => {
      try {
        const data = await backend.read();
        if (Array.isArray(data)) items = data;
      } catch {}
    })());

  const persist = async () => {
    try { await backend.write(items); } catch (e) { console.warn("PromptBlocks: не удалось сохранить шаблоны", e); }
  };

  return {
    load,
    list: () => items.slice(),
    async add(name, text, extra = {}) {
      await load();
      items.push({ id: Date.now().toString(36), name, text, ...extra });
      await persist();
    },
    async update(id, patch) {
      await load();
      items = items.map((t) => (t.id === id ? { ...t, ...patch } : t));
      await persist();
    },
    async remove(id) {
      await load();
      items = items.filter((t) => t.id !== id);
      await persist();
    },
    // Переносит запись в начало списка (например, «включённое — наверх»). Остальной порядок
    // не трогает — только вынимает элемент и ставит его первым.
    async moveToFront(id) {
      await load();
      const idx = items.findIndex((t) => t.id === id);
      if (idx > 0) { const [it] = items.splice(idx, 1); items.unshift(it); }
      await persist();
    },
    // Обратное — переносит запись в конец списка (например, «выключенное — вниз»).
    async moveToBack(id) {
      await load();
      const idx = items.findIndex((t) => t.id === id);
      if (idx >= 0 && idx < items.length - 1) { const [it] = items.splice(idx, 1); items.push(it); }
      await persist();
    },
  };
}
