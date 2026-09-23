import { el, btn, small, BTN_H } from "./dom.js";

const DYNAMIC_COUNT = 8; // запас высоты под списки, длина которых заранее неизвестна

// Минимальная высота ноды по самому длинному меню (+ кнопка «Назад»).
const maxCount = (items) => {
  if (typeof items === "function") return DYNAMIC_COUNT;
  return Math.max(items.length, ...items.map((i) => (i.children ? maxCount(i.children) : 0)));
};

export const menuMinHeight = (...menus) =>
  (Math.max(...menus.map(maxCount)) + 1) * (BTN_H + 6) + 16;

// Навигация по дереву меню внутри самой ноды.
// Пункт: { icon?, label, children? } — подменю (массив или функция, возвращающая массив),
//        { icon?, label, make(ctx) } — лист, создающий объект,
//        { icon?, label, view(ctx, api) } — своя форма (api.back() — вернуться),
//   любой пункт может иметь edit (view с формой редактирования) — кнопка «✏️» — и onDelete() — кнопка «✕».
export class Menu {
  constructor(container, { onShow, onClose, ctx }) {
    this.container = container;
    this.onShow = onShow;
    this.onClose = onClose;
    this.ctx = ctx;
    this.stack = [];
  }

  open(items, onPick) {
    this.stack = [{ items, onPick }];
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

  #row(it, onPick) {
    const label = (it.icon ? it.icon + "  " : "") + it.label + (it.children ? "  ›" : "");
    const b = btn(label, "flex:1;");
    b.onclick = () => {
      if (it.children || it.view) {
        this.stack.push({ items: it.children, view: it.view, onPick });
        this.#draw();
      } else {
        onPick(it.make(this.ctx));
        this.#close();
      }
    };
    if (!it.onDelete && !it.edit) return b;

    const wrap = el("div", "display:flex;gap:4px;");
    wrap.append(b);
    if (it.edit) {
      const ed = small("✏️");
      ed.onclick = () => {
        this.stack.push({ view: it.edit, onPick });
        this.#draw();
      };
      wrap.append(ed);
    }
    const del = small("✕");
    del.onclick = async () => {
      if (!confirm(`Удалить «${it.label}»?`)) return;
      await it.onDelete();
      this.#draw();
    };
    if (it.onDelete) wrap.append(del);
    return wrap;
  }

  #draw() {
    const c = this.container;
    c.innerHTML = "";
    const back = btn("← Назад");
    back.onclick = this.#back;
    c.append(back);

    const top = this.stack[this.stack.length - 1];
    if (top.view) {
      c.append(top.view(this.ctx, { back: this.#back }));
    } else {
      const items = typeof top.items === "function" ? top.items() : top.items;
      items.forEach((it) => c.append(this.#row(it, top.onPick)));
    }
    this.ctx.fit();
  }
}
