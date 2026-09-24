/*
import { el, small } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit } from "./eventBus.js";

export function buildBlockCardShell(id, title, color, contentEl) {
  const up = small("↑"), down = small("↓"), del = small("✕");
  up.onclick = () => emit("promptBlock:action", { id, action: "moveUp" });
  down.onclick = () => emit("promptBlock:action", { id, action: "moveDown" });
  del.onclick = () => emit("promptBlock:action", { id, action: "remove" });

  const controls = el("div", "display:flex;gap:6px;flex-shrink:0;");
  controls.append(up, down, del);

  const header = el("div", "display:flex;align-items:center;justify-content:space-between;gap:8px;");
  header.append(
    el("span", `font-weight:600;font-size:13px;color:${THEME.text.title};min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`, title),
    controls
  );

  const body = el("div", "flex:1;display:flex;flex-direction:column;gap:8px;padding:9px 12px;box-sizing:border-box;min-width:0;");
  body.append(header, contentEl);

  const stripe = el("div", `width:3px;flex-shrink:0;background:${color || THEME.stripeFallback};`);
  const wrap = el(
    "div",
    `display:flex;background:${THEME.surface.card};border:1px solid ${THEME.border.card};border-radius:11px;overflow:hidden;box-sizing:border-box;`
  );
  wrap.append(stripe, body);
  return wrap;
}

*/
