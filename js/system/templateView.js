import { el, btn } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit, on } from "./eventBus.js";

// Строит строку одного шаблона — циклом, один и тот же код на любой шаблон (они все одинаковые):
// заголовок + три кнопки одинаковой ширины (закладка/редактировать/удалить), иконки — из реестра
// иконок по id (bookmark/edit/delete), не текстовым символом.
const ACTION_BTN_WIDTH = 22; // одна и та же ширина у всех трёх кнопок

function buildIconBtn(iconId) {
  const b = btn("", "display:flex;align-items:center;justify-content:center;padding:0;", ACTION_BTN_WIDTH);
  b.style.width = `${ACTION_BTN_WIDTH}px`;
  emit("icon:get", { id: iconId, size: 13, resolve: (iconEl) => b.append(iconEl) });
  return b;
}

// Форма редактирования — рисует и разворачивает её сам templateView, никуда за этим не ходит:
// данные уже есть в template (та же ссылка, что в реестре). «Сохранить» шлёт saveTemplate наружу
// (это меняет реестр — чужая забота, templateEditor.js), «Отмена» просто закрывает форму, без событий.
export function buildEditForm(template, close, blockId) {
  const box = el("div", "display:flex;flex-direction:column;gap:6px;padding:8px;margin-left:18px;");
  const titleInput = el("input", "width:100%;box-sizing:border-box;");
  titleInput.value = template.name ?? "";
  const contentInput = el("textarea", "width:100%;box-sizing:border-box;resize:vertical;");
  contentInput.rows = 3;
  contentInput.value = template.text ?? "";

  const row = el("div", "display:flex;gap:6px;");
  const saveBtn = btn("Сохранить", "flex:1;");
  const cancelBtn = btn("Отмена", "flex:1;");
  saveBtn.onclick = () => {
    emit("saveTemplate", { id: template.id, title: titleInput.value, content: contentInput.value, blockId });
    close();
  };
  cancelBtn.onclick = () => close();
  row.append(saveBtn, cancelBtn);

  box.append(titleInput, contentInput, row);
  return box;
}

export function buildTemplateView(template, blockId) {
  const row = btn(
    "",
    "display:flex;align-items:center;gap:6px;justify-content:flex-start;text-align:left;",
    THEME.heights.templateRow
  );

  // Дефолтный шаблон (встроенная категория) — иконка слева по его собственному id из реестра
  // иконок. У пользовательских шаблонов иконки пока нет — решим позже.
  if (template.default) {
    emit("icon:get", { id: template.id, size: 14, resolve: (iconEl) => row.append(iconEl) });
  }

  row.append(el(
    "span",
    "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
    template.name ?? template.title ?? ""
  ));

  // Категория (template.category — например «План кадра», «Камера» внутри Шота): не лист, клик
  // не создаёт блок, а шлёт СВОЁ СОБСТВЕННОЕ событие (template.id), точно так же, как это делает
  // blockView для блоков верхнего уровня — то же самое обезличенное событие, никакой спецлогики
  // и никаких прямых вызовов. templateBuilder.js ловит его так же, как ловит id блоков — та же
  // самая матрёшка, просто ещё на один уровень глубже, сколько угодно раз.
  if (template.category) {
    const arrow = el("span", "opacity:.5;flex-shrink:0;", "›");
    row.append(arrow);
    let isExpanded = false;
    row.onclick = () => {
      isExpanded = !isExpanded;
      arrow.textContent = isExpanded ? "⌄" : "›";
      emit(template.id, { afterEl: row });
    };
    return row;
  }

  // Клик по самой строке (не по ★/✏️/✕ — у них свой stopPropagation) — «взять этот шаблон и
  // вставить его как настоящий блок в промпт».
  row.onclick = () => emit("addBlockToMenu", { blockId, template });

  const bookmarkBtn = buildIconBtn("bookmark");
  bookmarkBtn.onclick = (e) => {
    e.stopPropagation();
    emit("template:bookmark", { template });
  };
  row.append(bookmarkBtn);

  // Дефолтные шаблоны (template.default — встроенные категории вроде ролей референса или планов
  // шота) нельзя редактировать/удалять — это не пользовательские данные. Только закладка.
  if (!template.default) {
    const deleteBtn = buildIconBtn("delete");
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      emit("template:delete", { template });
    };

    // «Редактировать» — не шлёт ничего наружу, сам локально разворачивает/сворачивает свою форму.
    let formEl = null;
    const editBtn = buildIconBtn("edit");
    editBtn.onclick = (e) => {
      e.stopPropagation();
      if (formEl) { formEl.remove(); formEl = null; return; }
      formEl = buildEditForm(template, () => { formEl?.remove(); formEl = null; }, blockId);
      row.after(formEl);
    };

    row.append(editBtn, deleteBtn);
  }

  return row;
}

// templates — список из TemplateBuilder (system/templateBuilder.js); один и тот же buildTemplateView
// на каждый элемент, циклом.
export function buildTemplateViews(templates, blockId) {
  return templates.map((t) => buildTemplateView(t, blockId));
}

// Кнопка «Создать новый шаблон» (в templateBuilder.js) — плоская, сама ничего не рисует, только
// шлёт "createTemplate" с afterEl (после какого элемента вставлять). Ловит это здесь же —
// та же форма, что и для редактирования, просто с пустым шаблоном.
let createFormEl = null;
on("createTemplate", ({ afterEl, blockId } = {}) => {
  if (createFormEl) { createFormEl.remove(); createFormEl = null; return; }
  createFormEl = buildEditForm({ id: undefined, name: "", text: "" }, () => { createFormEl?.remove(); createFormEl = null; }, blockId);
  afterEl?.after(createFormEl);
});
