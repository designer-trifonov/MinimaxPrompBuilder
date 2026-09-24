import { emit } from "./eventBus.js";
import { THEME } from "./theme.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

function buildPill(template, onSelect) {
  const color = template.color || THEME.accent;
  const pill = el(
    "button",
    `cursor:pointer;border-radius:999px;white-space:nowrap;flex-shrink:0;padding:5px 12px;font-size:12px;background:${color}22;border:1px solid ${color}66;color:${color};`,
    template.name ?? template.title ?? ""
  );
  pill.onclick = () => (onSelect ? onSelect(template) : emit("pill:click", { template }));
  return pill;
}

export function buildPills(templates, onSelect) {
  const row = el("div", "display:flex;gap:6px;overflow-x:auto;flex-wrap:nowrap;");
  (templates || []).filter((t) => t.bookmarked).forEach((t) => row.append(buildPill(t, onSelect)));
  return row;
}
