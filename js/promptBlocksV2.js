import { app } from "../../scripts/app.js";
import { initNode } from "./system/bootstrap.js";
import { on } from "./system/eventBus.js";
import { container as promptBlockList, registerBlock } from "./system/promptBlockOrderManager.js";
import { buildBlock } from "./system/blockBuilder.js";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

function stopKeysBubbling(root) {
  const stop = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") e.stopPropagation();
  };
  root.addEventListener("keydown", stop);
  root.addEventListener("keypress", stop);
  root.addEventListener("keyup", stop);
}

app.registerExtension({
  name: "PromptBlocksV2",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "PromptBlocksV2") return;

    const onCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onCreated?.apply(this, arguments);
      const node = this;
      const promptW = node.widgets.find((w) => w.name === "prompt");
      if (promptW) {
        promptW.hidden = true;
        promptW.options = { ...(promptW.options || {}), hidden: true };
        promptW.computeSize = () => [0, -4];
      }
      const blocksW = node.widgets.find((w) => w.name === "blocks");
      if (blocksW) {
        blocksW.hidden = true;
        blocksW.options = { ...(blocksW.options || {}), hidden: true };
        blocksW.computeSize = () => [0, -4];
      }

      const root = el("div", "display:flex;flex-direction:column;gap:6px;width:100%;box-sizing:border-box;margin-top:8px;");
      const mainView = el("div", "display:flex;flex-direction:column;gap:8px;");
      root.append(mainView, promptBlockList);
      stopKeysBubbling(root);

      const fit = () => {
        node.size[1] = 0;
        node.setSize([node.size[0], Math.max(root.scrollHeight + 70, 160)]);
        app.graph.setDirtyCanvas(true, true);
      };

      const rebuildMain = () => {
        mainView.innerHTML = "";
        mainView.append(initNode().root);
      };

      const showMain = () => {
        rebuildMain();
        fit();
      };

      rebuildMain();
      showMain();

      on("showMainMenu", () => showMain());

      on("promptText:changed", ({ text } = {}) => {
        if (promptW) promptW.value = text ?? "";
      });

      on("promptBlocks:changed", ({ blocks } = {}) => {
        if (blocksW) blocksW.value = JSON.stringify(blocks ?? []);
      });

      if (blocksW?.value) {
        try {
          const saved = JSON.parse(blocksW.value);
          saved.forEach((blockData) => registerBlock(blockData.id, buildBlock(blockData), blockData));
        } catch {
        }
      }

      node.addDOMWidget("editor", "prompt_blocks_v2_ui", root, { serialize: false, getMinHeight: () => 60 });
      node.setSize([460, 200]);
      new ResizeObserver(() => fit()).observe(root);
      fit();
    };
  },
});
