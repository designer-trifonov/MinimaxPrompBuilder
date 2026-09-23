// Мелкие DOM-помощники. ctx = { save, fit, rerender } — колбэки узла.

export const BTN_H = 30;

export const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

// white-space/overflow/text-overflow — длинные подписи (например, названия поз) обрезаются
// многоточием в одну строку, а не вылезают за пределы фиксированной высоты кнопки.
export const btn = (text, css = "") =>
  el("button", `height:${BTN_H}px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${css}`, text);
export const small = (text) => el("button", "cursor:pointer;padding:0 6px;", text);

export function textArea(obj, ctx, rows = 3) {
  const ta = el("textarea", `width:100%;resize:vertical;box-sizing:border-box;${obj.h ? `height:${obj.h}px;` : ""}`);
  ta.rows = rows;
  ta.value = obj.text || "";
  ta.addEventListener("input", () => { obj.text = ta.value; ctx.save(); });
  ta.addEventListener("mouseup", () => { obj.h = ta.offsetHeight; ctx.fit(); });
  return ta;
}

export function textInput(obj, key, ctx, w = "60px") {
  const i = el("input", `width:${w};box-sizing:border-box;`);
  i.value = obj[key] ?? "";
  i.addEventListener("input", () => { obj[key] = i.value; ctx.save(); });
  return i;
}

export function numInput(obj, key, ctx, w = "60px") {
  const i = el("input", `width:${w};box-sizing:border-box;`);
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

// Подсветка выбранной кнопки-«фишки» — единое место для этого стиля вместо повторения в разных файлах.
export const CHIP_ON = "2px solid #6aa3ff";

// Группа кнопок-переключателей: options = [[значение, подпись], ...].
// compact — мельче шрифт и паддинг, для длинных списков вариантов внутри плотных блоков.
// onChange(val) — если задан, вызывается вместо ctx.save() (например, чтобы попутно перерисовать
// соседние поля или пересобрать весь блок через ctx.rerender()).
export function segmented(obj, key, options, ctx, { compact = false, onChange } = {}) {
  const wrap = el("div", "display:flex;gap:3px;flex-wrap:wrap;");
  const paint = () => [...wrap.children].forEach((b, k) => {
    const on = obj[key] === options[k][0];
    b.style.fontWeight = on ? "bold" : "normal";
    b.style.outline = on ? CHIP_ON : "none";
  });
  options.forEach(([val, label]) => {
    const b = small(label);
    if (compact) b.style.cssText += "font-size:11px;padding:2px 6px;";
    b.onclick = () => { obj[key] = val; paint(); onChange ? onChange(val) : ctx.save(); };
    wrap.append(b);
  });
  paint();
  return wrap;
}

// Ряд кнопок-фишек без привязанного объекта: клик выбирает/снимает значение (toggle).
// Для случаев вроде «выбери один из уже существующих референсов» — список значений динамический
// и не ложится в схему segmented() «объект.поле».
export function chipToggle(values, { selected, onPick }) {
  const wrap = el("div", "display:flex;gap:2px;flex-wrap:wrap;");
  const paint = () => [...wrap.children].forEach((b, k) => { b.style.outline = values[k] === selected() ? CHIP_ON : "none"; });
  values.forEach((v) => {
    const b = small(v);
    b.style.fontSize = "11px";
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
  const ctl = el("div", "display:flex;gap:2px;");
  const up = small("↑"), dn = small("↓"), del = small("✕");
  up.onclick = () => move(-1);
  dn.onclick = () => move(1);
  del.onclick = () => { arr.splice(i, 1); ctx.rerender(); };
  ctl.append(up, dn, del);
  h.append(ctl);
  return h;
}

// Блок верхнего уровня как отдельная плашка: светлее общего фона ноды, скруглённые углы,
// стрелка ▾/▸ слева от заголовка сворачивает тело. b — сам объект блока (арr[i]), для хранения
// b._collapsed между перерисовками.
export function card(title, arr, i, ctx, bodyChildren, opts = {}) {
  const b = arr[i];
  // gap:10px — расстояние между полями внутри блока (например, между «Что на референсе»
  // и «Что делаем», или между временем шота и списком его элементов). Раньше было 4px и всё слипалось.
  const body = el("div", "display:flex;flex-direction:column;gap:10px;");
  body.append(...bodyChildren);
  const arrow = small(b._collapsed ? "▸" : "▾");
  arrow.style.cssText = "font-size:11px;padding:0 4px;";
  arrow.onclick = () => {
    b._collapsed = !b._collapsed;
    body.style.display = b._collapsed ? "none" : "flex";
    arrow.textContent = b._collapsed ? "▸" : "▾";
  };
  if (b._collapsed) body.style.display = "none";
  const wrap = el(
    "div",
    // gap:12px — отступ между заголовком (со стрелкой сворачивания) и телом блока, вдвое больше прежнего.
    "background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:12px;box-sizing:border-box;"
  );
  wrap.append(head(title, arr, i, ctx, { ...opts, collapseArrow: arrow }), body);
  return wrap;
}
