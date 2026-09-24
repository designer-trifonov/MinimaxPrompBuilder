// Запоминает последнее сфокусированное текстовое поле ввода (и позицию курсора в нём) по всему
// документу — чтобы пилюля закладки (bookmarkPillView.js) знала, куда вставлять текст, откуда бы
// её ни нажали. Один раз слушает document — не по полю на каждое.
let last = null; // { field, start, end }

function remember(e) {
  const f = e.target;
  if (f.tagName === "TEXTAREA" || f.tagName === "INPUT") {
    last = { field: f, start: f.selectionStart, end: f.selectionEnd };
  }
}
["focusin", "keyup", "mouseup"].forEach((ev) => document.addEventListener(ev, remember));

// Вставляет text в последнее запомненное поле (если оно всё ещё в документе), в позицию курсора.
export function insertAtCursor(text) {
  if (!last || !document.contains(last.field)) return false;
  const f = last.field;
  f.focus();
  f.setRangeText(text, last.start ?? f.value.length, last.end ?? f.value.length, "end");
  last = { field: f, start: f.selectionStart, end: f.selectionEnd };
  f.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}
