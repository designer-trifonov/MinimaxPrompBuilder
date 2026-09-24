import { on, emit } from "./eventBus.js";
import { buildTemplateViews } from "./templateView.js";
import { userFileBackend } from "./serverBackend.js";

const BTN_CSS = "appearance:none;-webkit-appearance:none;box-sizing:border-box;padding:0 10px;height:30px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#42454f;border:1px solid rgba(255,255,255,.07);border-radius:8px;color:#dcdee3;";

const el = (tag, css = "", text = "") => {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (text) e.textContent = text;
  return e;
};

const btn = (text, css = "") => el("button", `${BTN_CSS}${css}`, text);

const cache = new Map();
function loadTemplates(id) {
  if (!cache.has(id)) {
    cache.set(id, (async () => {
      const stored = await userFileBackend(`PromptBlocks/${id}.json`).read();
      if (stored) return stored;
      const r = await fetch(new URL(`./templates/${id}.json`, import.meta.url));
      if (!r.ok) throw new Error("no registry");
      return r.json();
    })());
  }
  return cache.get(id);
}

async function persist(blockId) {
  if (!cache.has(blockId)) return;
  const list = await cache.get(blockId);
  await userFileBackend(`PromptBlocks/${blockId}.json`).write(list);
}

function buildTemplateList(templates, blockId) {
  const box = el("div", "display:flex;flex-direction:column;gap:6px;margin-bottom:18px;");
  buildTemplateViews(templates, blockId).forEach((row) => box.append(row));

  const createBtn = btn("+ Создать новый шаблон", "border-style:dashed;background:transparent;");
  createBtn.onclick = () => emit("createTemplate", { afterEl: createBtn, blockId });
  box.append(createBtn);

  return box;
}

async function removeTemplate(template) {
  for (const [blockId, promise] of cache.entries()) {
    const list = await promise;
    const idx = list.indexOf(template);
    if (idx !== -1) {
      list.splice(idx, 1);
      await persist(blockId);
      return true;
    }
  }
  return false;
}

async function saveTemplate({ id, title, content, blockId }) {
  if (id !== undefined) {
    for (const [ownBlockId, promise] of cache.entries()) {
      const list = await promise;
      const found = list.find((t) => t.id === id);
      if (found) {
        found.name = title;
        found.text = content;
        await persist(ownBlockId);
        return found;
      }
    }
  }
  const list = await loadTemplates(blockId);
  const created = { id: `tpl_${Date.now().toString(36)}`, name: title, text: content };
  list.push(created);
  await persist(blockId);
  return created;
}

function reset() {
  inserted.forEach((box) => box.remove());
  inserted.clear();
}

async function refresh(blockId) {
  const box = inserted.get(blockId);
  if (!box) return;
  const templates = await loadTemplates(blockId);
  box.innerHTML = "";
  buildTemplateViews(templates, blockId).forEach((row) => box.append(row));
  const createBtn = btn("+ Создать новый шаблон", "border-style:dashed;background:transparent;");
  createBtn.onclick = () => emit("createTemplate", { afterEl: createBtn, blockId });
  box.append(createBtn);
}

async function refreshAll() {
  await Promise.all([...inserted.keys()].map(refresh));
}

export const TemplateBuilder = { loadTemplates, buildTemplateList, removeTemplate, saveTemplate, reset, refresh, refreshAll, persist };

const inserted = new Map();

export function subscribe() {
  on("templateClicked", async ({ id, afterEl, parentEl } = {}) => {
    const shown = inserted.get(id);
    if (shown) {
      shown.remove();
      inserted.delete(id);
      return;
    }
    let templates;
    try {
      templates = await loadTemplates(id);
    } catch {
      if (id?.startsWith("promptBlock")) {
        TemplateBuilder.reset();
        emit("showMainMenu", {});
        return;
      }
      templates = [];
    }
    const box = buildTemplateList(templates, id);
    if (parentEl) {
      const backBtn = btn("← Назад", "align-self:flex-start;");
      backBtn.onclick = () => emit("backToMenu", {});
      box.prepend(backBtn);
      parentEl.append(box);
    } else {
      afterEl?.after(box);
    }
    inserted.set(id, box);
  });

  on("backToMenu", () => {
    TemplateBuilder.reset();
    emit("showMainMenu", {});
  });
}
