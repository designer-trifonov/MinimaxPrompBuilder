/*
import { insertAtCursor } from "./cursorTracker.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

export function buildBookmarkPillView(pill) {
  const b = el(
    "button",
    `cursor:pointer;border-radius:999px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;` +
    `max-width:140px;padding:5px 12px;font-size:12px;background:${pill.color}22;border:1px solid ${pill.color}66;color:${pill.color};`,
    pill.name || "Без названия"
  );
  b.title = pill.text;
  b.onclick = () => insertAtCursor(pill.text);
  return b;
}

export function buildBookmarkPillViews(pills) {
  return pills.map(buildBookmarkPillView);
}

*/
