// Мелкие DOM-помощники. ctx = { save, fit, rerender } — колбэки узла.
import { THEME } from "./theme.js";
import { icon } from "../system/iconRegistry.js";

// Высота по умолчанию для кнопок, не входящих в именованные группы THEME.heights (см. theme.js) —
// например, «+ Добавить в шот», «Сохранить пресет» и т.п. Сами именованные группы (панель ноды,
// «Назад», пункты меню, шаблоны) передают высоту явно третьим аргументом в btn().
export const BTN_H = THEME.heights.listRow;

export const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

// ComfyUI/LiteGraph слушает нажатия клавиш глобально на document (стрелки, Delete, Ctrl+Z и т.п.
// горячие клавиши канваса) и перехватывает их раньше, чем они долетают до поля ввода внутри
// нашего DOM-виджета — из-за этого набирать текст с клавиатуры не получается (а вставка через
// буфер обмена работает, потому что идёт другим путём). Останавливаем всплытие ДО document —
// вызывается один раз на корневой элемент виджета каждой ноды (см. promptBlocks.js/sceneBuilder.js/
// loraGuide.js), а не на каждое поле ввода по отдельности.
export function stopKeysBubbling(root) {
  const stop = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") e.stopPropagation();
  };
  root.addEventListener("keydown", stop);
  root.addEventListener("keypress", stop);
  root.addEventListener("keyup", stop);
}

// Общие рецепты фона/полей ввода — единое место, чтобы все кнопки и окна ввода по всему интерфейсу
// (не только в новых карточках) были на одной тёмной скруглённой теме, а не на дефолтном браузерном виде.
// appearance:none — САМОЕ ВАЖНОЕ: без этого <button> рендерится с нативной платформенной темой
// (appearance:auto), у которой своя внутренняя минимальная высота, не подчиняющаяся нашему height —
// именно из-за неё «← Назад» и мелкие кнопки small() (✏️/★/✕) были выше, чем заданные в THEME.heights
// px, хотя height был прописан явно. box-sizing:border-box + явный padding — чтобы этот заданный
// height не "плавал" от паддинга браузера поверх него.
const BTN_CSS = `appearance:none;-webkit-appearance:none;box-sizing:border-box;padding:0 10px;background:${THEME.surface.button};border:1px solid ${THEME.border.button};border-radius:8px;color:${THEME.text.button};`;
// Фон полей ввода — самый тёмный уровень поверхности (THEME.surface.input), специально НЕ
// поднимается вместе с card/nested/button, чтобы явно отличаться от фона карточки и не сливаться
// с ней. Экспортирован — loraGuide.js использует ту же строку для полей, собранных вручную (там
// свой async-паттерн сохранения, не через textInput()/textArea() ниже), чтобы поля ввода были
// ПИКСЕЛЬ-В-ПИКСЕЛЬ одинаковые в обеих нодах.
export const INPUT_CSS = `background:${THEME.surface.input};border:1px solid ${THEME.border.input};border-radius:8px;color:${THEME.text.input};padding:6px 8px;font:inherit;box-sizing:border-box;`;

// white-space/overflow/text-overflow — длинные подписи (например, названия поз) обрезаются
// многоточием в одну строку, а не вылезают за пределы фиксированной высоты кнопки.
// height — по умолчанию BTN_H (см. выше), но именованные группы кнопок (панель ноды, «Назад»,
// строки меню/шаблонов) передают конкретное поле THEME.heights.* явно, чтобы у каждой группы
// была своя настраиваемая высота из одной точки истины.
export const btn = (text, css = "", height = BTN_H) =>
  el("button", `height:${height}px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${BTN_CSS}${css}`, text);
// Маленькая иконка-кнопка (↑ ↓ ✕, стрелка сворачивания и т.п.) — скруглённая, приглушённая,
// не спорит с крупными кнопками (btn), но и не голая как раньше.
// БЕЗ фиксированной height: своей высоты у неё нет — она берёт высоту родительского flex-ряда
// (align-items:stretch — поведение по умолчанию, см. lib/menu.js#row, где родитель — wrap с
// height:${rowHeight}px, единственный источник истины для всей строки). display:inline-flex тут
// только чтобы центрировать сам глиф (✏️/★/✕) внутри той высоты, что дал родитель — не задаёт
// высоту сама по себе.
export const small = (text) =>
  el(
    "button",
    `appearance:none;-webkit-appearance:none;cursor:pointer;padding:0 7px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:6px;border:none;background:${THEME.surface.smallBtn};color:${THEME.text.muted};`,
    text
  );

export function textArea(obj, ctx, rows = 3) {
  const ta = el("textarea", `width:100%;resize:vertical;box-sizing:border-box;${INPUT_CSS}${obj.h ? `height:${obj.h}px;` : ""}`);
  ta.rows = rows;
  ta.value = obj.text || "";
  ta.addEventListener("input", () => { obj.text = ta.value; ctx.save(); });
  ta.addEventListener("mouseup", () => { obj.h = ta.offsetHeight; ctx.fit(); });
  return ta;
}

export function textInput(obj, key, ctx, w = "60px") {
  const i = el("input", `width:${w};box-sizing:border-box;${INPUT_CSS}`);
  i.value = obj[key] ?? "";
  i.addEventListener("input", () => { obj[key] = i.value; ctx.save(); });
  return i;
}

export function numInput(obj, key, ctx, w = "60px") {
  const i = el("input", `width:${w};box-sizing:border-box;${INPUT_CSS}`);
  i.type = "number"; i.step = "0.5"; i.min = "0";
  i.value = obj[key];
  i.addEventListener("input", () => {
    // Время не может превышать длительность видео (duration ноды — точка истины).
    const v = Math.min(Number(i.value) || 0, ctx.duration());
    if (v !== Number(i.value)) i.value = v;
    obj[key] = v;
    ctx.save();
  });
  return i;
}

// Акцентный цвет — выбранные пилюли (segmented), пилюли-теги и т.п. Один цвет на весь интерфейс,
// чтобы «выбрано» читалось однозначно и не спорило с цветными полосками карточек (CARD_COLORS).
export const ACCENT = THEME.accent;

// Иконки вынесены в отдельный скрипт — ../system/iconRegistry.js (ICONS + icon()) — тут их больше нет.

// Общая палитра «своих» цветов — для пользовательских меток/шаблонов (метки режима у LoRA Guide,
// цвет сохранённого шаблона у PromptBlocks и т.п.). Одно место, а не по копии на каждый файл.
export const PALETTE = THEME.palette;

// Пилюля: скруглённая кнопка-фишка. on — подсвечена акцентным цветом (выбрано), иначе — нейтральный
// тёмный фон. Общий стиль для segmented()/chipToggle(), чтобы группы переключателей выглядели
// одинаково по всему интерфейсу (окошки/обводки вместо голых <button>).
function pill(text, compact = false) {
  const b = el(
    "button",
    `cursor:pointer;border-radius:999px;border:1px solid transparent;white-space:nowrap;` +
    `padding:${compact ? "3px 9px" : "4px 11px"};font-size:${compact ? "11px" : "12px"};` +
    `background:${THEME.surface.pillOff};color:${THEME.text.pillOff};transition:background .1s,color .1s;`,
    text
  );
  return b;
}
function paintPill(b, on) {
  b.style.background = on ? ACCENT : THEME.surface.pillOff;
  b.style.color = on ? THEME.text.pillOn : THEME.text.pillOff;
  b.style.borderColor = on ? ACCENT : "transparent";
}

// Пилюля-тег для вставки (см. tagPalette.js «Вставить: <Subject 1> ...») — того же скруглённого
// формата, что и segmented()/chipToggle(), но с акцентной обводкой вместо заливки: это не переключатель
// состояния, а разовое действие («вставить»), поэтому не должна выглядеть «выбранной».
export function tagChip(text) {
  return el(
    "button",
    `cursor:pointer;border-radius:999px;border:1px solid ${THEME.tag.border};white-space:nowrap;` +
    `padding:3px 10px;font-size:11.5px;background:${THEME.tag.bg};color:${THEME.tag.text};`,
    text
  );
}

// Группа пилюль-переключателей: options = [[значение, подпись], ...].
// compact — мельче шрифт и паддинг, для длинных списков вариантов внутри плотных блоков.
// onChange(val) — если задан, вызывается вместо ctx.save() (например, чтобы попутно перерисовать
// соседние поля или пересобрать весь блок через ctx.rerender()).
export function segmented(obj, key, options, ctx, { compact = false, onChange } = {}) {
  const wrap = el("div", "display:flex;gap:5px;flex-wrap:wrap;");
  const paint = () => [...wrap.children].forEach((b, k) => paintPill(b, obj[key] === options[k][0]));
  options.forEach(([val, label]) => {
    const b = pill(label, compact);
    b.onclick = () => { obj[key] = val; paint(); onChange ? onChange(val) : ctx.save(); };
    wrap.append(b);
  });
  paint();
  return wrap;
}

// Ряд пилюль без привязанного объекта: клик выбирает/снимает значение (toggle).
// Для случаев вроде «выбери один из уже существующих референсов» — список значений динамический
// и не ложится в схему segmented() «объект.поле».
export function chipToggle(values, { selected, onPick }) {
  const wrap = el("div", "display:flex;gap:5px;flex-wrap:wrap;");
  const paint = () => [...wrap.children].forEach((b, k) => paintPill(b, values[k] === selected()));
  values.forEach((v) => {
    const b = pill(v, true);
    b.onclick = () => { onPick(v); paint(); };
    wrap.append(b);
  });
  paint();
  return wrap;
}

export function row(...children) {
  const r = el("div", "display:flex;gap:6px;align-items:center;flex-wrap:wrap;");
  r.append(...children);
  return r;
}

// Шапка блока: заголовок + стрелки ↑ ↓ и удаление. arr — массив, в котором лежит элемент.
// sameKind — двигать можно только рядом с блоком того же типа (иерархия верхнего уровня).
// collapseArrow — стрелка ▾/▸ слева от заголовка, сворачивающая body в card() ниже.
export function head(title, arr, i, ctx, { sameKind = false, collapseArrow = null } = {}) {
  const move = (d) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    if (sameKind && arr[j].type !== arr[i].type) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    ctx.rerender();
  };
  const h = el("div", "display:flex;justify-content:space-between;align-items:center;gap:4px;");
  const left = el("div", "display:flex;align-items:center;gap:4px;");
  if (collapseArrow) left.append(collapseArrow);
  left.append(el("span", "font-weight:bold;user-select:none;", title));
  h.append(left);
  const ctl = el("div", "display:flex;gap:6px;");
  const up = small("↑"), dn = small("↓"), del = small("✕");
  [up, dn, del].forEach((x) => (x.style.cssText += "opacity:.5;"));
  up.onclick = () => move(-1);
  dn.onclick = () => move(1);
  del.onclick = () => { arr.splice(i, 1); ctx.rerender(); };
  ctl.append(up, dn, del);
  h.append(ctl);
  return h;
}

// Цвет левой полоски по типу блока — категория видна с первого взгляда, не читая текст.
// Полоска — отдельный элемент (не border), поэтому со скруглёнными углами карточки не режется.
export const CARD_COLORS = THEME.category;

// Обрезает текст до N символов для сводки в шапке свёрнутой карточки — не тащить весь textarea в одну строку.
const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n).trim()}…` : s || "");
export { truncate };

// Блок верхнего уровня как отдельная плашка: скруглённая со всех сторон, цветная полоска слева
// (opts.color, см. CARD_COLORS), стрелка ▾/▸ слева от заголовка сворачивает тело, а справа —
// краткое резюме содержимого (opts.summary), чтобы свёрнутый блок оставался читаемым без раскрытия.
// b — сам объект блока (arr[i]), для хранения b._collapsed между перерисовками.
export function card(title, arr, i, ctx, bodyChildren, opts = {}) {
  const b = arr[i];
  // gap:10px — расстояние между полями внутри блока (например, между «Что на референсе»
  // и «Что делаем», или между временем шота и списком его элементов). Раньше было 4px и всё слипалось.
  const body = el("div", "display:flex;flex-direction:column;gap:10px;");
  body.append(...bodyChildren);

  const arrow = el("span", `font-size:12px;color:${THEME.text.summary};flex-shrink:0;width:10px;text-align:center;user-select:none;`, b._collapsed ? "›" : "⌄");
  const titleSpan = el(
    "span",
    `font-weight:${opts.boldTitle === false ? 400 : 600};font-size:13px;color:${THEME.text.title};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`,
    title
  );
  const summary = el(
    "span",
    `font-size:11.5px;color:${THEME.text.summary};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;`,
    opts.summary || ""
  );

  // rightControl — свой контрол вместо стандартного ↑↓✕ (например, LoRA Guide вместо
  // перестановки/удаления — которых там нет, список = папка на диске — показывает переключатель вкл/выкл).
  let ctl;
  if (opts.rightControl) {
    ctl = opts.rightControl;
  } else {
    const move = (d) => {
      const j = i + d;
      if (j < 0 || j >= arr.length) return;
      if (opts.sameKind && arr[j].type !== arr[i].type) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      ctx.rerender();
    };
    const up = small("↑"), dn = small("↓"), del = small("✕");
    [up, dn, del].forEach((x) => (x.style.cssText += "opacity:.4;font-size:11px;"));
    up.onclick = (e) => { e.stopPropagation(); move(-1); };
    dn.onclick = (e) => { e.stopPropagation(); move(1); };
    del.onclick = (e) => { e.stopPropagation(); arr.splice(i, 1); ctx.rerender(); };
    ctl = el("div", "display:flex;gap:6px;flex-shrink:0;");
    ctl.append(up, dn, del);
  }

  const left = el("div", "display:flex;align-items:center;gap:7px;min-width:0;cursor:pointer;flex-shrink:1;");
  left.append(arrow);
  if (opts.icon) left.append(icon(opts.icon, { size: 17, color: opts.iconColor || opts.color || THEME.text.pillOff }));
  left.append(titleSpan);
  left.onclick = () => {
    b._collapsed = !b._collapsed;
    body.style.display = b._collapsed ? "none" : "flex";
    arrow.textContent = b._collapsed ? "›" : "⌄";
    ctx.fit();
  };
  if (b._collapsed) body.style.display = "none";

  const headerRow = el("div", "display:flex;align-items:center;gap:8px;");
  headerRow.append(left, summary, ctl);

  const stripe = el("div", `width:3px;flex-shrink:0;background:${opts.color || THEME.stripeFallback};`);
  const content = el(
    "div",
    // gap:10px — отступ между заголовком (со стрелкой сворачивания) и телом блока.
    "flex:1;padding:9px 12px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box;min-width:0;"
  );
  content.append(headerRow, body);
  const wrap = el(
    "div",
    `display:flex;background:${THEME.surface.card};border:1px solid ${THEME.border.card};border-radius:11px;overflow:hidden;box-sizing:border-box;`
  );
  wrap.append(stripe, content);
  return wrap;
}
