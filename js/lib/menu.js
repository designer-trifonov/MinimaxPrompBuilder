import { el, btn, small } from "./dom.js";
import { icon, ICONS } from "../system/iconRegistry.js";
import { THEME } from "./theme.js";
import { emit } from "../system/eventBus.js";

const DYNAMIC_COUNT = 8; // запас высоты под списки, длина которых заранее неизвестна
const ROW_GAP = 6; // тот же зазор, что раньше закладывался в (BTN_H + 6)

// Высота строки меню по её роли — одна точка истины (THEME.heights, см. theme.js):
// обычный пункт списка (категория/подменю), «+ Новый ... (вручную)» или сохранённый шаблон.
const rowHeight = (it) => {
  if (it.rowKind === "new") return THEME.heights.newTemplate;
  if (it.rowKind === "template") return THEME.heights.templateRow;
  return THEME.heights.listRow;
};

// Минимальная высота ноды по самому длинному меню (+ кнопка «Назад»). Строим по максимуму из
// всех высот строк, чтобы гарантированно хватило места вне зависимости от того, какого типа
// строки окажутся в самом длинном списке.
const maxCount = (items) => {
  if (typeof items === "function") return DYNAMIC_COUNT;
  return Math.max(items.length, ...items.map((i) => (i.children ? maxCount(i.children) : 0)));
};
const MAX_ROW_H = Math.max(THEME.heights.listRow, THEME.heights.newTemplate, THEME.heights.templateRow);

export const menuMinHeight = (...menus) =>
  Math.max(...menus.map(maxCount)) * (MAX_ROW_H + ROW_GAP) + (THEME.heights.back + ROW_GAP) + 16;

// Навигация по дереву меню внутри самой ноды. Один и тот же компонент — Block — на любой глубине:
// Пункт: { icon?, label, children? } — Block с вложенными Block'ами/шаблонами (массив или функция,
//        возвращающая массив) — раскрывается ВСЕГДА рекурсивно на месте, «матрёшкой», под собой в
//        том же списке; сколько бы уровней вложенности ни было — поведение везде одно и то же,
//        никакого разделения на «разворачивается»/«уводит на новую страницу»;
//        { icon?, label, emitId, payload? } — лист-Template: клик не создаёт объект сам, а шлёт
//        emit(emitId, {ctx, payload, resolve}) — билдер, подписанный на emitId в eventBus.js (каждый
//        block/item регистрирует свой on(id, ...) при загрузке модуля), сам решает, чем наполнить
//        объект, и вызывает resolve(объект) — тогда меню подхватывает его через onPick и закрывается.
//        Меню НИЧЕГО не знает о содержимом — только id и данные листа;
//        { icon?, label, view(ctx, api) } — форма (api.back() — вернуться) — это единственный случай
//        настоящей навигации по стеку страниц (#stack), потому что форма — это не список, а экран
//        ввода, ей нужна вся ширина и Назад должен именно ЗАКРЫТЬ форму, а не свернуть Block.
//   Любой пункт-Template может иметь edit (своя форма редактирования) — кнопка «✏️», onDelete() —
//   «✕», onToggleBookmark()+bookmarked (звёздочка «в ленту закладок») — все три действия шлют своё
//   обезличенное событие в eventBus (lib/eventBus.js) с id пункта, а КАКОЙ текст/данные это несёт —
//   решает не меню, а слушатель (templates.js/blocks/items — они же и передали onDelete/edit/onToggleBookmark).
export class Menu {
  constructor(container, { onShow, onClose, ctx }) {
    this.container = container;
    this.onShow = onShow;
    this.onClose = onClose;
    this.ctx = ctx;
    this.stack = [];
    this.expanded = new Set(); // ключи — путь label'ов от корня (см. #row), разворот на любой глубине
  }

  open(items, onPick) {
    this.stack = [{ items, onPick }];
    this.expanded = new Set();
    this.onShow();
    this.#draw();
  }

  // Открывает форму сразу, без списка пунктов (кнопка «Назад» закрывает меню).
  openView(view) {
    this.stack = [{ view }];
    this.onShow();
    this.#draw();
  }

  #back = () => {
    this.stack.pop();
    this.stack.length ? this.#draw() : this.#close();
  };

  #close() {
    this.stack = [];
    this.onClose();
  }

  // path — путь label'ов от корня списка до этого пункта (включая сам пункт), например
  // ["Шот", "Действие", "Действие — мы (зритель, POV)"]. Не объект-ссылка: children() у групп
  // (groupedTemplateEntries) пересоздаёт объекты при каждой перерисовке, а путь по label'ам
  // остаётся стабильным — раскрытая ветка не «схлопывается» сама по себе при перерисовке.
  #row(it, onPick, path) {
    const key = path.join(" / ");
    const depth = path.length - 1;
    // it.icon — имя из ICONS (lib/dom.js) рисуется настоящей SVG-иконкой; старые emoji-иконки,
    // ещё не переведённые в этот набор, остаются текстовым префиксом (fallback), ничего не ломаем.
    const known = it.icon && ICONS[it.icon];
    const expanded = it.children && this.expanded.has(key);
    const b = btn(
      "",
      `flex:1;display:flex;align-items:center;gap:8px;justify-content:flex-start;text-align:left;${depth ? `margin-left:${depth * 18}px;width:calc(100% - ${depth * 18}px);` : ""}`,
      rowHeight(it)
    );
    if (known) b.append(icon(it.icon, { size: 14 }));
    if (it.color) b.append(el("span", `width:9px;height:9px;border-radius:999px;flex-shrink:0;background:${it.color};`));
    b.append(el(
      "span",
      "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",
      (known ? "" : it.icon ? `${it.icon}  ` : "") + it.label
    ));
    if (it.children) b.append(el("span", "opacity:.5;flex-shrink:0;", expanded ? "⌄" : "›"));
    b.onclick = () => {
      if (it.children) {
        expanded ? this.expanded.delete(key) : this.expanded.add(key);
        emit("menu:toggle", { path, expanded: !expanded });
        this.#draw();
      } else if (it.view) {
        this.stack.push({ items: it.children, view: it.view, onPick });
        this.#draw();
      } else {
        emit(it.emitId, {
          ctx: this.ctx,
          payload: it.payload,
          resolve: (made) => { onPick(made); this.#close(); },
        });
      }
    };
    if (!it.onDelete && !it.edit && !it.onToggleBookmark) return b;

    // wrap — родитель-слой этой строки, ЕДИНСТВЕННЫЙ источник её высоты (rowHeight(it), из
    // THEME.heights). height задан явно только здесь; b и иконки-кнопки (small(), dom.js) своей
    // высоты не имеют — align-items:stretch (по умолчанию у flex, ничего не переопределяем)
    // растягивает их всех под высоту wrap, а не наоборот (раньше было наоборот: wrap растягивался
    // под самого высокого ребёнка — из-за эмодзи-глифов в small() строка "плавала").
    const wrap = el("div", `display:flex;gap:4px;height:${rowHeight(it)}px;`);
    wrap.append(b);
    if (it.onToggleBookmark) {
      const star = small(it.bookmarked ? "★" : "☆");
      star.style.color = it.bookmarked ? THEME.status.bookmark : THEME.text.summary;
      star.title = it.bookmarked ? "Убрать из ленты закладок" : "В ленту закладок";
      star.onclick = async () => {
        await it.onToggleBookmark();
        emit("template:bookmark", { path, label: it.label, bookmarked: !it.bookmarked });
        this.#draw();
      };
      wrap.append(star);
    }
    if (it.edit) {
      const ed = small("✏️");
      ed.onclick = () => {
        this.stack.push({ view: it.edit, onPick });
        emit("template:edit", { path, label: it.label });
        this.#draw();
      };
      wrap.append(ed);
    }
    const del = small("✕");
    del.onclick = async () => {
      if (!confirm(`Удалить «${it.label}»?`)) return;
      await it.onDelete();
      emit("template:delete", { path, label: it.label });
      this.#draw();
    };
    if (it.onDelete) wrap.append(del);
    return wrap;
  }

  // Рекурсивно рисует список пунктов + (для развёрнутых Block'ов) их детей сразу под собой —
  // матрёшка любой глубины, один и тот же механизм на каждом уровне.
  #renderList(items, onPick, parentPath) {
    const out = [];
    items.forEach((it) => {
      const path = [...parentPath, it.label];
      out.push(this.#row(it, onPick, path));
      if (it.children && this.expanded.has(path.join(" / "))) {
        const kids = typeof it.children === "function" ? it.children() : it.children;
        out.push(...this.#renderList(kids, onPick, path));
      }
    });
    return out;
  }

  #draw() {
    const c = this.container;
    c.innerHTML = "";
    const back = btn("← Назад", "", THEME.heights.back);
    back.onclick = this.#back;
    c.append(back);

    const top = this.stack[this.stack.length - 1];
    if (top.view) {
      c.append(top.view(this.ctx, { back: this.#back }));
    } else {
      const items = typeof top.items === "function" ? top.items() : top.items;
      c.append(...this.#renderList(items, top.onPick, []));
    }
    this.ctx.fit();
  }
}
