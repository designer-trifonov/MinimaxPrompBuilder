// Точка входа ноды Scene Builder. Логика объектов живёт в scene/, общее — в lib/.
import { app } from "../../scripts/app.js";
import { el, btn } from "./lib/dom.js";
import { Menu } from "./lib/menu.js";
import { OBJECTS, OBJECT_MENU } from "./scene/objects/index.js";
import { compileScene } from "./scene/compile.js";

const MENU_MIN_H = 320; // резерв высоты под меню, пока оно открыто

app.registerExtension({
  name: "SceneBuilder",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "SceneBuilder") return;

    const onCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onCreated?.apply(this, arguments);
      const node = this;
      const W = (n) => node.widgets.find((w) => w.name === n);
      const blocksW = W("blocks"), promptW = W("prompt");
      [blocksW, promptW].forEach((w) => {
        w.hidden = true;
        w.options = { ...(w.options || {}), hidden: true };
        w.computeSize = () => [0, -4];
      });

      let state = [];

      const root = el("div", "display:flex;flex-direction:column;gap:6px;width:100%;box-sizing:border-box;");
      const mainView = el("div", "display:flex;flex-direction:column;gap:8px;");
      const list = el("div", "display:flex;flex-direction:column;gap:8px;");
      const bar = el("div", "display:flex;gap:6px;");
      const addBtn = btn("+ Добавить объект", "flex:2;");
      const copyBtn = btn("Копировать", "flex:1;");
      bar.append(addBtn, copyBtn);
      mainView.append(list, bar);
      const menuView = el("div", "display:none;flex-direction:column;gap:6px;");
      root.append(mainView, menuView);

      const fit = () => {
        node.setSize([node.size[0], Math.max(root.scrollHeight + 70, 160)]);
        app.graph.setDirtyCanvas(true, true);
      };
      const save = () => {
        blocksW.value = JSON.stringify(state);
        promptW.value = compileScene(state);
      };
      const render = () => {
        list.innerHTML = "";
        state.forEach((o, i) => list.append(OBJECTS[o.kind].render(o, i, ctx)));
        menuView.style.display = "none";
        mainView.style.display = "flex";
        root.style.minHeight = "0";
      };
      const rerender = () => { render(); save(); fit(); };

      const ctx = {
        save, fit, rerender,
        getState: () => state,
        openMenu: (items, onPick) => menu.open(items, onPick),
        openView: (view) => menu.openView(view),
      };
      const menu = new Menu(menuView, {
        ctx,
        onShow: () => { mainView.style.display = "none"; menuView.style.display = "flex"; root.style.minHeight = `${MENU_MIN_H}px`; },
        onClose: rerender,
      });
      addBtn.onclick = () => menu.open(OBJECT_MENU, (o) => state.push(o));

      copyBtn.onclick = async () => {
        save();
        const text = promptW.value;
        try { await navigator.clipboard.writeText(text); }
        catch {
          const t = document.createElement("textarea");
          t.value = text; document.body.append(t); t.select();
          document.execCommand("copy"); t.remove();
        }
        const old = copyBtn.textContent;
        copyBtn.textContent = "Скопировано ✓";
        setTimeout(() => (copyBtn.textContent = old), 1200);
      };

      node._sbLoad = () => {
        let arr = [];
        try { arr = JSON.parse(blocksW.value); } catch {}
        state = Array.isArray(arr) ? arr.filter((o) => OBJECTS[o.kind]) : [];
        render(); save(); fit();
      };

      node.addDOMWidget("editor", "scene_ui", root, { serialize: false, getMinHeight: () => 60 });
      blocksW.value = "[]";
      promptW.value = "";
      node.setSize([460, 200]);
      new ResizeObserver(() => fit()).observe(list);
    };

    const onConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
      onConfigure?.apply(this, arguments);
      setTimeout(() => this._sbLoad?.(), 0);
    };
  },
});
