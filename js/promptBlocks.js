// Точка входа: связывает узел ComfyUI с модулями. Логика блоков живёт в blocks/ и items/.
import { app } from "../../scripts/app.js";
import { el, btn } from "./lib/dom.js";
import { Menu, menuMinHeight } from "./lib/menu.js";
import { extractTags, createPalette } from "./lib/tagPalette.js";
import { BLOCKS, TOP_MENU } from "./blocks/index.js";
import { SHOT_MENU } from "./items/index.js";
import { compile, migrate, rank } from "./core/compile.js";
import { refTemplateStore } from "./core/stores.js";

const MENU_MIN_H = menuMinHeight(TOP_MENU, SHOT_MENU);

app.registerExtension({
  name: "PromptBlocks",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "PromptBlocks") return;

    const onCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onCreated?.apply(this, arguments);
      const node = this;
      const W = (n) => node.widgets.find((w) => w.name === n);
      const blocksW = W("blocks"), promptW = W("prompt"), durW = W("duration");
      // Служебные поля прячем: новый интерфейс читает options.hidden, старый — hidden.
      [blocksW, promptW].forEach((w) => {
        w.hidden = true;
        w.options = { ...(w.options || {}), hidden: true };
        w.computeSize = () => [0, -4];
      });

      let state = [];

      // --- каркас ---
      const root = el("div", `display:flex;flex-direction:column;gap:6px;width:100%;box-sizing:border-box;`);
      const mainView = el("div", "display:flex;flex-direction:column;gap:8px;");
      const list = el("div", "display:flex;flex-direction:column;gap:8px;");
      const bar = el("div", "display:flex;gap:6px;");
      const addBtn = btn("+ Добавить блок", "flex:2;");
      const copyBtn = btn("Копировать", "flex:1;");
      const presetBtn = btn("📋 Шаблон", "flex:1;");
      bar.append(addBtn, copyBtn, presetBtn);
      const palette = createPalette(root, { onSizeChange: () => fit() });
      mainView.append(list, palette.el, bar);
      const menuView = el("div", "display:none;flex-direction:column;gap:6px;");
      root.append(mainView, menuView);

      // --- контекст для блоков ---
      const fit = () => {
        node.setSize([node.size[0], Math.max(root.scrollHeight + 70, 160)]);
        app.graph.setDirtyCanvas(true, true);
      };
      const save = () => {
        blocksW.value = JSON.stringify(state);
        promptW.value = compile(state);
        palette.update(extractTags(state, (b) => BLOCKS[b.type]?.group === "ref"));
      };
      const render = () => {
        state.sort((a, b) => rank(a) - rank(b)); // иерархия: стабильно, порядок внутри типа сохраняется
        list.innerHTML = "";
        state.forEach((b, i) => list.append(BLOCKS[b.type].render(b, i, ctx)));
        menuView.style.display = "none";
        mainView.style.display = "flex";
        root.style.minHeight = "0"; // резерв под меню нужен только пока оно открыто
      };
      const rerender = () => { render(); save(); fit(); };

      const ctx = {
        save, fit, rerender,
        getState: () => state,
        duration: () => Number(durW.value) || 5,
        shotNumber: (shot) => state.slice(0, state.indexOf(shot) + 1).filter((b) => b.type === "shot").length,
        openMenu: (items, onPick) => menu.open(items, onPick),
      };

      const menu = new Menu(menuView, {
        ctx,
        onShow: () => { mainView.style.display = "none"; menuView.style.display = "flex"; root.style.minHeight = `${MENU_MIN_H}px`; },
        onClose: rerender,
      });
      addBtn.onclick = () => menu.open(TOP_MENU, (b) => state.push(b));

      // Шаблон целиком: весь текущий набор блоков (референсы, стиль, шоты, звук, музыка —
      // всё что есть в state) сохраняется/восстанавливается одним пунктом. Отдельно от шаблонов
      // на отдельные блоки (стиль/звук/музыка и т.д. — у них свои хранилища и кнопки внутри блока).
      const savePresetView = (_ctx, { back }) => {
        const box = el("div", "display:flex;flex-direction:column;gap:6px;");
        const name = el("input", "width:100%;box-sizing:border-box;");
        name.placeholder = "Название пресета (например: Актриса + смена одежды)";
        const info = el("div", "opacity:.7;font-size:12px;", `Блоков в текущем наборе: ${state.length}`);
        const saveB = btn("Сохранить пресет");
        saveB.onclick = async () => {
          if (!name.value.trim() || !state.length) return;
          await refTemplateStore.add(name.value.trim(), "", { blocks: JSON.parse(JSON.stringify(state)) });
          back();
        };
        box.append(name, info, saveB);
        return box;
      };
      const presetMenuItems = () => [
        ...refTemplateStore.list().map((t) => ({
          label: `${t.name} (${(t.blocks || []).length})`,
          make: () => (t.blocks || []).map((b) => JSON.parse(JSON.stringify(b))),
          onDelete: () => refTemplateStore.remove(t.id),
        })),
        { icon: "💾", label: "Сохранить текущий набор как пресет", view: savePresetView },
      ];
      // items передаём функцией (не вызываем сразу) — чтобы удаление (✕) сразу перерисовывало
      // список заново из хранилища, как это уже сделано у других шаблонов (см. interaction.js).
      presetBtn.onclick = () => menu.open(presetMenuItems, (blocks) => state.push(...blocks));

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

      // Секунды во всех блоках подрезаются под текущую duration и при загрузке, и при её изменении.
      const clampTimes = () => state.forEach((b) => BLOCKS[b.type].clamp?.(b, ctx.duration()));
      let lastDuration = ctx.duration();
      const watch = setInterval(() => {
        if (ctx.duration() === lastDuration) return;
        // Длительность выросла: время, стоявшее на прежнем максимуме, тянется вслед за ней.
        if (ctx.duration() > lastDuration) {
          state.filter((b) => b.type === "shot").forEach((shot) => {
            if (Number(shot.end) === lastDuration) shot.end = ctx.duration();
            shot.items.forEach((it) => { if (it.t === "action" && Number(it.to) === lastDuration) it.to = ctx.duration(); });
          });
        }
        lastDuration = ctx.duration();
        clampTimes();
        rerender();
      }, 300);
      const onRemoved = node.onRemoved;
      node.onRemoved = function () { clearInterval(watch); onRemoved?.apply(this, arguments); };

      node._pbLoad = () => {
        let arr = [];
        try { arr = JSON.parse(blocksW.value); } catch {}
        state = migrate(arr).filter((b) => BLOCKS[b.type]);
        clampTimes();
        render(); save(); fit();
      };

      node.addDOMWidget("editor", "blocks_ui", root, { serialize: false, getMinHeight: () => 60 });
      blocksW.value = "[]";
      promptW.value = "";
      node.setSize([460, 200]);
      new ResizeObserver(() => fit()).observe(list);
    };

    const onConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
      onConfigure?.apply(this, arguments);
      setTimeout(() => this._pbLoad?.(), 0);
    };
  },
});
