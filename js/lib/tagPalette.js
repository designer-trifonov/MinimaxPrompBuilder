import { el, small } from "./dom.js";

// Ищет в референс-блоках теги <Subject N>, <Picture N>, <Video N>, <Audio N> простым поиском по тексту.
const TAG_RE = /<(Subject|Picture|Video|Audio) (\d+)>/g;
const ORDER = { Subject: 0, Picture: 1, Video: 2, Audio: 3 };

export function extractTags(state, isRef) {
  const found = new Map();
  for (const b of state) {
    if (!isRef(b)) continue;
    const text = b.text || "";
    for (const m of text.matchAll(TAG_RE)) {
      if (!found.has(m[0])) found.set(m[0], { tag: m[0], kind: m[1], n: Number(m[2]), hint: text.trim().slice(0, 50) });
    }
  }
  return [...found.values()].sort((a, b) => ORDER[a.kind] - ORDER[b.kind] || a.n - b.n);
}

// Полоска кнопок-фишек. Клик вставляет тег в окно ввода, где последний раз стоял курсор
// (внутри root); если такого окна нет — копирует тег в буфер обмена.
export function createPalette(root, { onSizeChange }) {
  const box = el("div", "display:none;flex-wrap:wrap;gap:4px;align-items:center;");
  let last = null; // { field, start, end }
  let key = "";

  const remember = (e) => {
    const f = e.target;
    if (f.tagName === "TEXTAREA" || f.tagName === "INPUT") last = { field: f, start: f.selectionStart, end: f.selectionEnd };
  };
  ["focusin", "keyup", "mouseup", "focusout"].forEach((ev) => root.addEventListener(ev, remember));

  const insert = async (tag, chip) => {
    if (last && document.contains(last.field)) {
      const f = last.field;
      f.focus();
      f.setRangeText(tag, last.start ?? f.value.length, last.end ?? f.value.length, "end");
      last = { field: f, start: f.selectionStart, end: f.selectionEnd };
      f.dispatchEvent(new Event("input", { bubbles: true })); // обновит сохранённый текст блока
      return;
    }
    try { await navigator.clipboard.writeText(tag); } catch {}
    const old = chip.textContent;
    chip.textContent = "скопировано";
    setTimeout(() => (chip.textContent = old), 900);
  };

  return {
    el: box,
    update(tags) {
      const next = tags.map((t) => t.tag + t.hint).join("|");
      if (next === key) return;
      key = next;
      box.innerHTML = "";
      box.style.display = tags.length ? "flex" : "none";
      if (tags.length) box.append(el("span", "opacity:.7;", "Вставить:"));
      tags.forEach((t) => {
        const chip = small(t.tag);
        chip.title = t.hint;
        chip.onmousedown = (e) => e.preventDefault(); // не сбрасывать курсор в окне ввода
        chip.onclick = () => insert(t.tag, chip);
        box.append(chip);
      });
      onSizeChange();
    },
  };
}
