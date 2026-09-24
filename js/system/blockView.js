import { emit } from "./eventBus.js";
import { THEME } from "./theme.js";
import { TemplateBuilder } from "./templateBuilder.js";
import { buildPills } from "./pillBuilder.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

const FIELD_CSS = `background:${THEME.surface.input};border:1px solid ${THEME.border.input};border-radius:8px;color:${THEME.text.input};padding:6px 8px;font:inherit;box-sizing:border-box;`;
const CTRL_BTN_CSS = `cursor:pointer;background:transparent;border:none;color:${THEME.text.muted};padding:0 3px;`;

function buildField(block, field) {
  const row = el("div", "display:flex;align-items:center;gap:6px;");
  row.append(el("span", `color:${THEME.text.muted};font-size:12px;`, field.label ?? field.key));
  const input = el(field.type === "textarea" ? "textarea" : "input", `flex:1;${FIELD_CSS}`);
  if (field.type === "number") input.type = "number";
  input.value = block.values?.[field.key] ?? field.default ?? "";
  input.oninput = () => {
    block.values ??= {};
    block.values[field.key] = input.value;
  };
  row.append(input);
  return row;
}

function buildControls(onAction) {
  const controls = el("div", "display:flex;gap:2px;flex-shrink:0;");
  const upBtn = el("button", CTRL_BTN_CSS, "↑");
  const downBtn = el("button", CTRL_BTN_CSS, "↓");
  const delBtn = el("button", CTRL_BTN_CSS, "✕");
  upBtn.onclick = () => onAction?.("moveUp");
  downBtn.onclick = () => onAction?.("moveDown");
  delBtn.onclick = () => onAction?.("remove");
  controls.append(upBtn, downBtn, delBtn);
  return controls;
}

export function renderBlock(block, { onPillSelect, onAction } = {}) {
  const root = el("div", "display:flex;flex-direction:column;gap:8px;border-radius:12px;padding:10px 14px;");

  function paint() {
    root.innerHTML = "";
    const color = block.color || THEME.accent;
    root.style.background = THEME.surface.card;
    root.style.border = `1px solid ${color}`;

    const header = el("div", "display:flex;align-items:center;gap:8px;");
    emit("icon:get", { id: block.icon, size: 16, color, resolve: (iconEl) => iconEl && header.append(iconEl) });
    header.append(el("span", `flex:1;color:${THEME.text.title};font-size:14px;`, block.title ?? ""));
    header.append(buildControls(onAction));
    root.append(header);

    if (block.text) {
      root.append(el("div", `color:${THEME.text.button};font-size:13px;white-space:pre-wrap;`, block.text));
    }

    if (block.fields?.length) {
      block.fields.forEach((field) => root.append(buildField(block, field)));
    }

    if (block.children?.length) {
      const childrenBox = el("div", "display:flex;flex-direction:column;gap:8px;margin-left:14px;");
      block.children.forEach((child) => childrenBox.append(renderBlock(child, { onPillSelect, onAction })));
      root.append(childrenBox);
    }

    if (block.blockId) {
      TemplateBuilder.loadTemplates(block.blockId).then((siblings) => {
        const pillsRow = buildPills(siblings, (template) => onPillSelect?.(template, paint));
        root.append(pillsRow);
      });
    }
  }

  paint();
  return root;
}
