const listeners = new Map();

export function on(id, handler) {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id).add(handler);
  return () => off(id, handler);
}

export function off(id, handler) {
  listeners.get(id)?.delete(handler);
}

export function emit(id, payload) {
  const set = listeners.get(id);
  if (!set || !set.size) {
    console.warn(`PromptBlocks: emit("${id}") — нет ни одного билдера, подписанного на этот id`);
    return;
  }
  set.forEach((h) => h(payload));
}

export const eventBus = { on, off, emit };
