import { el, btn, row, segmented } from "./dom.js";

// Форма «название + описание → сохранить как шаблон». Используется как view в меню.
// editing — существующий шаблон: форма откроется с его значениями и сохранит изменения на месте.
// fields — необязательные доп. поля-переключатели: [{ key, label, options: [[значение, подпись], ...] }]
export const templateForm = (store, { saveLabel, namePlaceholder = "Название", textPlaceholder = "Описание", fields = [] }, editing = null) =>
  (ctx, { back }) => {
    const box = el("div", "display:flex;flex-direction:column;gap:6px;");
    const extra = Object.fromEntries(fields.map((f) => [f.key, editing?.[f.key] ?? f.options[0][0]]));
    fields.forEach((f) => box.append(row(el("span", "", f.label), segmented(extra, f.key, f.options, { save() {} }))));
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
      const data = { name: name.value.trim(), text: text.value.trim(), ...extra };
      if (editing) await store.update(editing.id, data);
      else await store.add(data.name, data.text, extra);
      back();
    };
    box.append(name, text, save);
    return box;
  };
