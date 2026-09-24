// Точка входа новой ноды PromptBlocksV2 — регистрирует расширение в ComfyUI, подключает
// system/bootstrap.js (новую систему) к DOM ноды и переключает главную/менюшную вьюхи.
// Старую PromptBlocks (promptBlocks.js) не трогает.
import { app } from "../../scripts/app.js";
import { el, stopKeysBubbling } from "./lib/dom.js";
import { initNode } from "./system/bootstrap.js";
import { on } from "./system/eventBus.js";
import { AddBlockListBuilder } from "./system/addBlockListBuilder.js";
import { container as promptBlockList } from "./system/promptBlockOrderManager.js";

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

      const root = el("div", "display:flex;flex-direction:column;gap:6px;width:100%;box-sizing:border-box;");
      const mainView = el("div", "display:flex;flex-direction:column;gap:8px;");
      const menuView = el("div", "display:none;flex-direction:column;gap:6px;");
      root.append(mainView, menuView);
      stopKeysBubbling(root);

      const fit = () => {
        node.size[1] = 0;
        node.setSize([node.size[0], Math.max(root.scrollHeight + 70, 160)]);
        app.graph.setDirtyCanvas(true, true);
      };

      const rebuildMain = () => {
        mainView.innerHTML = "";
        mainView.append(initNode().root, promptBlockList);
      };

      const showMain = () => {
        rebuildMain(); // главная панель пересобирается заново (например, обновить ленту пилюль)
        menuView.innerHTML = "";
        menuView.style.display = "none";
        mainView.style.display = "flex";
        fit();
      };
      const showMenu = (builtList) => {
        menuView.innerHTML = "";
        menuView.append(builtList);
        mainView.style.display = "none";
        menuView.style.display = "flex";
        fit();
      };

      rebuildMain();
      showMain();

      // «+ Добавить блок» (mainMenuBuilder.js) шлёт "addBlock" без resolve — сами ловим и сами
      // строим список через AddBlockListBuilder.build() напрямую.
      on("addBlock", async () => showMenu(await AddBlockListBuilder.build()));
      // «← Назад» (addBlockListBuilder.js) уже шлёт "showMainMenu" сам — просто возвращаемся.
      on("showMainMenu", () => showMain());

      // Держим скрытое поле prompt в актуальном состоянии для Python-выхода ноды.
      on("promptText:changed", ({ text } = {}) => {
        if (promptW) promptW.value = text ?? "";
      });

      node.addDOMWidget("editor", "prompt_blocks_v2_ui", root, { serialize: false, getMinHeight: () => 60 });
      node.setSize([460, 200]);
      new ResizeObserver(() => fit()).observe(root);
      fit();
    };
  },
});
