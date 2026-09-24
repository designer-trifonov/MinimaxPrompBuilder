import { el, btn, row, segmented, PALETTE } from "./dom.js";
import { THEME } from "./theme.js";

// Форма «название + описание → сохранить как шаблон». Используется как view в меню.
// editing — существующий шаблон: форма откроется с его значениями и сохранит изменения на месте.
// fields — необязательные доп. поля-переключатели: [{ key, label, options: [[значение, подпись], ...] }]
// colorPicker — ряд цветных кружков вместо текстовых пилюль (свой цвет шаблона — полоска карточки
// и пилюля в ленте закладок будут этого цвета, см. templates.js/textBlock.js); "нет цвета" — фолбэк
// на обычный цвет типа блока (CARD_COLORS).
export const templateForm = (store, { saveLabel, namePlaceholder = "Название", textPlaceholder = "Описание", fields = [], colorPicker = false }, editing = null) =>
  (ctx, { back }) => {
    const box = el("div", "display:flex;flex-direction:column;gap:6px;");
    const extra = Object.fromEntries(fields.map((f) => [f.key, editing?.[f.key] ?? f.options[0][0]]));
    fields.forEach((f) => box.append(row(el("span", "", f.label), segmented(extra, f.key, f.options, { save() {} }))));

    let color = editing?.color || "";
    if (colorPicker) {
      const swatchRow = el("div", "display:flex;gap:6px;align-items:center;flex-wrap:wrap;");
      const swatches = [];
      const paint = () => swatches.forEach(([v, sw]) => {
        sw.style.outline = v === color ? `2px solid ${THEME.text.outlineOn}` : "none";
        sw.style.outlineOffset = "1px";
      });
      const none = el("span", `width:18px;height:18px;border-radius:999px;cursor:pointer;border:1px dashed ${THEME.border.dashedStrong};box-sizing:border-box;display:inline-block;`);
      none.title = "Без своего цвета (обычный цвет типа блока)";
      none.onclick = () => { color = ""; paint(); };
      swatches.push(["", none]);
      swatchRow.append(none);
      PALETTE.forEach((c) => {
        const sw = el("span", `width:18px;height:18px;border-radius:999px;cursor:pointer;background:${c};display:inline-block;`);
        sw.onclick = () => { color = c; paint(); };
        swatches.push([c, sw]);
        swatchRow.append(sw);
      });
      paint();
      box.append(row(el("span", "", "Цвет:"), swatchRow));
    }

    const name = el("input", "width:100%;box-sizing:border-box;");
    name.placeholder = namePlaceholder;
    name.value = editing?.name ?? "";
    const text = el("textarea", "width:100%;box-sizing:border-box;resize:vertical;");
    text.rows = 6;
    text.placeholder = textPlaceholder;
    text.value = editing?.text ?? "";
    const save = btn(editing ? "Сохранить изменения" : saveLabel);
    save.onclick = async () => {
      if (!name.value.trim() || !text.value.trim()) return;
      const data = { name: name.value.trim(), text: text.value.trim(), ...extra, ...(colorPicker ? { color } : {}) };
      if (editing) await store.update(editing.id, data);
      else await store.add(data.name, data.text, { ...extra, ...(colorPicker ? { color } : {}) });
      back();
    };
    box.append(name, text, save);
    return box;
  };
