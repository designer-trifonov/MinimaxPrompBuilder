/*
let last = null;

function remember(e) {
  const f = e.target;
  if (f.tagName === "TEXTAREA" || f.tagName === "INPUT") {
    last = { field: f, start: f.selectionStart, end: f.selectionEnd };
  }
}
["focusin", "keyup", "mouseup"].forEach((ev) => document.addEventListener(ev, remember));

export function insertAtCursor(text) {
  if (!last || !document.contains(last.field)) return false;
  const f = last.field;
  f.focus();
  f.setRangeText(text, last.start ?? f.value.length, last.end ?? f.value.length, "end");
  last = { field: f, start: f.selectionStart, end: f.selectionEnd };
  f.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

*/
