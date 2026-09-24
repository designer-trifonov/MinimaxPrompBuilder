/*
import { el } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit } from "./eventBus.js";
import { buildBlockCardShell } from "./blockCardShell.js";
import { registerBlock } from "./promptBlockOrderManager.js";

let instanceCount = 0;

export function buildShotPromptBlockView(template) {
  const id = `shotEvent_${++instanceCount}`;
  const color = THEME.category.shot;
  const content = el("div", "display:flex;flex-direction:column;gap:8px;min-width:0;");

  const timeRow = el("div", "display:flex;align-items:center;gap:6px;");
  const startInput = el("input", "width:60px;box-sizing:border-box;");
  startInput.type = "number"; startInput.value = "0";
  const endInput = el("input", "width:60px;box-sizing:border-box;");
  endInput.type = "number"; endInput.value = "5";
  timeRow.append(el("span", "", "с"), startInput, el("span", "", "по"), endInput, el("span", "", "сек"));

  const textArea = el("textarea", "width:100%;box-sizing:border-box;resize:vertical;");
  textArea.rows = 2;
  textArea.value = template?.name === "Пустой шот" ? "" : (template?.name ?? "");

  const update = () => emit("promptBlock:update", {
    id, blockId: "shotEvent",
    text: `[Shot ${startInput.value}-${endInput.value}s] ${textArea.value}`,
  });
  textArea.addEventListener("input", update);
  startInput.addEventListener("input", update);
  endInput.addEventListener("input", update);
  update();

  const addToShotBtn = el("button", "cursor:pointer;border-style:dashed;background:transparent;", "+ Добавить в шот");
  addToShotBtn.onclick = () => {
    emit("addBlock", {
      resolve: (builtList) => {
        const shotRow = builtList.querySelector('[data-block-id="shotEvent"]');
        shotRow?.click();
      },
    });
  };

  content.append(timeRow, textArea, addToShotBtn);
  registerBlock(id, buildBlockCardShell(id, "Шот", color, content));
}

*/
