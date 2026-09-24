// Единая шина обезличенных событий. Публикующий код не знает, кто слушает и что тот делает —
// просто emit(id, payload). Слушатель подписывается по тому же id и сам решает, что делать
// с данными (например, куда вставить текст шаблона). Так меню (lib/menu.js) не обязано знать
// бизнес-логику конкретного блока/шаблона — оно только сообщает, ЧТО произошло и с каким id.
const listeners = new Map(); // id -> Set<handler>

export function on(id, handler) {
  if (!listeners.has(id)) listeners.set(id, new Set());
  listeners.get(id).add(handler);
  return () => off(id, handler); // удобно для одноразовой подписки: const unsub = on(...); ...; unsub();
}

export function off(id, handler) {
  listeners.get(id)?.delete(handler);
}

export function emit(id, payload) {
  const set = listeners.get(id);
  if (!set || !set.size) {
    // Билдер не подписался на этот id — почти всегда опечатка/забытая регистрация, а не «никому не надо».
    console.warn(`PromptBlocks: emit("${id}") — нет ни одного билдера, подписанного на этот id`);
    return;
  }
  set.forEach((h) => h(payload));
}

export const eventBus = { on, off, emit };
