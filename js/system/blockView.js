import { el, btn } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit } from "./eventBus.js";

// Одна строка блока главного меню — самостоятельная: сама хранит своё состояние разворота,
// сама разворачивается/сворачивается по клику и сама шлёт своё событие. Билдер списка
// (addBlockListBuilder.js) её только создаёт и вставляет в список, ничем больше не управляет.
export function buildBlockView(entry) {
  const isBack = entry.id === "back";
  let isExpanded = false;

  const row = btn(
    "",
    "display:flex;align-items:center;gap:8px;justify-content:flex-start;text-align:left;",
    THEME.heights.listRow
  );
  row.dataset.blockId = entry.id; // чтобы можно было найти конкретный блок в списке снаружи (авто-разворот)

  emit("icon:get", { id: entry.id, size: 14, resolve: (iconEl) => row.append(iconEl) });
  row.append(el(
    "span",
    "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
    entry.title
  ));

  // «Назад» — навигация, не блок: свой обезличенный id "backToMenu", без стрелки, не разворачивается.
  if (isBack) {
    row.onclick = () => emit("backToMenu", {});
    return row;
  }

  // Стрелка — своя, чисто визуальная забота blockView. Сама отрисовка/вставка/удаление шаблонов —
  // не его дело: он только сообщает templateBuilder.js, ПОСЛЕ какого элемента вставлять (afterEl),
  // и после КАЖДОГО клика шлёт одно и то же событие — templateBuilder сам решает, вставить или убрать.
  const arrow = el("span", "opacity:.5;flex-shrink:0;", "›");
  row.append(arrow);
  row.onclick = () => {
    isExpanded = !isExpanded;
    arrow.textContent = isExpanded ? "⌄" : "›";
    emit(entry.id, { afterEl: row });
  };

  return row;
}
