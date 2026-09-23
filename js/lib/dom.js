// Мелкие DOM-помощники. ctx = { save, fit, rerender } — колбэки узла.

export const BTN_H = 30;

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
// box-sizing:border-box + явный padding — без этого высота кнопки «плавает» в зависимости от того,
// достаётся ли ей дефолтный паддинг браузера (он пропадает при display:flex, как у строк меню.js,
// из-за чего они были ниже, чем обычная кнопка вроде «← Назад» с тем же height:BTN_H).
const BTN_CSS = "box-sizing:border-box;padding:0 10px;background:#2b2d33;border:1px solid rgba(255,255,255,.07);border-radius:8px;color:#dcdee3;";
// Фон полей ввода — примерно на 30% темнее, чем раньше (#1a1c20 -> #121416), чтобы явно отличаться
// от фона карточки (#25272c) и не сливаться с ней. Экспортирован — loraGuide.js использует ту же
// строку для полей, собранных вручную (там свой async-паттерн сохранения, не через textInput()/
// textArea() ниже), чтобы поля ввода были ПИКСЕЛЬ-В-ПИКСЕЛЬ одинаковые в обеих нодах.
export const INPUT_CSS = "background:#121416;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#e7e8ec;padding:6px 8px;font:inherit;box-sizing:border-box;";

// white-space/overflow/text-overflow — длинные подписи (например, названия поз) обрезаются
// многоточием в одну строку, а не вылезают за пределы фиксированной высоты кнопки.
export const btn = (text, css = "") =>
  el("button", `height:${BTN_H}px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${BTN_CSS}${css}`, text);
// Маленькая иконка-кнопка (↑ ↓ ✕, стрелка сворачивания и т.п.) — скруглённая, приглушённая,
// не спорит с крупными кнопками (btn), но и не голая как раньше.
export const small = (text) =>
  el("button", "cursor:pointer;padding:2px 7px;border-radius:6px;border:none;background:rgba(255,255,255,.05);color:#9a9ca3;", text);

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
export const ACCENT = "#4d7bf3";

// Минималистичный набор line-иконок (stroke, не fill — единая толщина линии, как на референсе),
// вместо цветных Unicode-emoji. viewBox 0 0 24 24 у всех — можно свободно менять size у icon().
// Раз бандлера нет (ComfyUI отдаёт js/ как статику), импортировать npm-пакет иконок нельзя —
// вписываем SVG-разметку строками, как и остальные DOM-хелперы в этом файле.
export const ICONS = {
  // Скрепка — референс «прикрепляет» картинку/видео к промпту, читается понятнее молнии.
  ref: '<path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49L12.95 2.56a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  // Настоящая палитра художника — блоб с вырезом под большой палец + мазки краски (точки-заливки).
  style: '<path d="M12 3a9 8.5 0 1 0 0 17c1.6 0 2.3-1 2.3-2.1 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.9-1.8H17a4 4 0 0 0 4-4C21 6 17 3 12 3Z"/><circle cx="8" cy="9.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="7.5" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="12.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.3" fill="currentColor" stroke="none"/>',
  shot: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  camera: '<rect x="2.5" y="7" width="13" height="10" rx="2"/><path d="M15.5 10.5 21 7.5v9l-5.5-3Z"/>',
  // Фотокарточка (не видеокамера) — для «Описание сцены»/«Шота»: прямоугольник-рамка + «горы с
  // солнцем», как в классических файловых менеджерах — горы опущены пониже, чтобы не задевать солнце.
  photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="8.5" r="1.5"/><path d="m4 19 4.5-4.5 3.5 3 3-2.5 5 4"/>',
  // Скруглённый чат-баллон одним ЦЕЛЬНЫМ контуром (не rect+path по отдельности — два разных
  // элемента давали видимый шов на стыке) — хвостик врезан в нижний левый угол вместо скругления.
  chat: '<path d="M5.5 5H18.5A2.5 2.5 0 0 1 21 7.5V13.5A2.5 2.5 0 0 1 18.5 16H9L5 20L8 16H5.5A2.5 2.5 0 0 1 3 13.5V7.5A2.5 2.5 0 0 1 5.5 5Z"/>',
  outfit: '<path d="M9 4 6 6l1 3-3 9h16l-3-9 1-3-3-2"/><path d="M9 4c0 1.7 1.3 3 3 3s3-1.3 3-3"/>',
  link: '<path d="M9 15 15 9"/><path d="M10 6h4a4 4 0 0 1 0 8h-1"/><path d="M14 18h-4a4 4 0 0 1 0-8h1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  frame: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M9 5v4M15 5v4"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7"/>',
  note: '<circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="16" r="2.5"/><path d="M9.5 18V6l10-2v12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.3" r="1.1" fill="currentColor" stroke="none"/>',
  // Шестигранник с точкой — «модуль/компонент» (запасной вариант, сейчас не используется).
  module: '<path d="M12 3 20 7.5v9L12 21 4 16.5v-9Z"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
  // Гаечный ключ — для LoRA Guide; цвет задаётся отдельно от полоски (opts.iconColor в card()),
  // зелёный/серый по l.enabled, а не фиксированный цвет категории.
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
};
// Иконка-<span> с встроенным SVG. color = "inherit" -> берёт цвет текста родителя (стрелки и т.п.),
// иначе задаётся явно (например, цвет полоски карточки — CARD_COLORS — или нейтральный серый
// для вложенных строк шота). Неизвестное имя (старые emoji-иконки меню, ещё не переведённые
// в этот набор) рендерится как обычный текст — ничего не ломается, просто не перекрашено.
export function icon(name, { size = 15, color = "currentColor" } = {}) {
  const paths = ICONS[name];
  if (!paths) return el("span", "", name || "");
  const span = el("span", `display:inline-flex;flex-shrink:0;width:${size}px;height:${size}px;color:${color};`);
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return span;
}

// Пилюля: скруглённая кнопка-фишка. on — подсвечена акцентным цветом (выбрано), иначе — нейтральный
// тёмный фон. Общий стиль для segmented()/chipToggle(), чтобы группы переключателей выглядели
// одинаково по всему интерфейсу (окошки/обводки вместо голых <button>).
function pill(text, compact = false) {
  const b = el(
    "button",
    `cursor:pointer;border-radius:999px;border:1px solid transparent;white-space:nowrap;` +
    `padding:${compact ? "3px 9px" : "4px 11px"};font-size:${compact ? "11px" : "12px"};` +
    `background:#31343b;color:#c7c9cf;transition:background .1s,color .1s;`,
    text
  );
  return b;
}
function paintPill(b, on) {
  b.style.background = on ? ACCENT : "#31343b";
  b.style.color = on ? "#fff" : "#c7c9cf";
  b.style.borderColor = on ? ACCENT : "transparent";
}

// Пилюля-тег для вставки (см. tagPalette.js «Вставить: <Subject 1> ...») — того же скруглённого
// формата, что и segmented()/chipToggle(), но с акцентной обводкой вместо заливки: это не переключатель
// состояния, а разовое действие («вставить»), поэтому не должна выглядеть «выбранной».
export function tagChip(text) {
  return el(
    "button",
    "cursor:pointer;border-radius:999px;border:1px solid rgba(77,123,243,.45);white-space:nowrap;" +
    "padding:3px 10px;font-size:11.5px;background:rgba(77,123,243,.12);color:#a9bdf8;",
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
export const CARD_COLORS = {
  ref: "#4d7bf3", style: "#e0a53f", shot: "#4bbf8a", sound: "#b47ecf", music: "#cf7ea0", lora: "#8a7cf0",
};

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

  const arrow = el("span", "font-size:12px;color:#8a8d94;flex-shrink:0;width:10px;text-align:center;user-select:none;", b._collapsed ? "›" : "⌄");
  const titleSpan = el(
    "span",
    `font-weight:${opts.boldTitle === false ? 400 : 600};font-size:13px;color:#eceef1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`,
    title
  );
  const summary = el(
    "span",
    "font-size:11.5px;color:#8a8d94;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;",
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
  if (opts.icon) left.append(icon(opts.icon, { size: 17, color: opts.iconColor || opts.color || "#c7c9cf" }));
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

  const stripe = el("div", `width:3px;flex-shrink:0;background:${opts.color || "#666"};`);
  const content = el(
    "div",
    // gap:10px — отступ между заголовком (со стрелкой сворачивания) и телом блока.
    "flex:1;padding:9px 12px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box;min-width:0;"
  );
  content.append(headerRow, body);
  const wrap = el(
    "div",
    "display:flex;background:#25272c;border:1px solid rgba(255,255,255,.05);border-radius:11px;overflow:hidden;box-sizing:border-box;"
  );
  wrap.append(stripe, content);
  return wrap;
}
