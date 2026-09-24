import { el, btn } from "../lib/dom.js";
import { on, emit } from "./eventBus.js";
import { buildTemplateViews } from "./templateView.js";

// Ловит события ЛЮБОГО уровня матрёшки — и блоков главного меню (visualStyleEvent/referenceEvent/
// shotEvent/soundsEvent/musicEvent), и категорий ВНУТРИ них (person/outfit/link/frame/photo/camera/
// clock/chat — подкатегории Шота). Ни блок (blockView.js), ни категория (templateView.js) сами
// ничего не рисуют — только шлют СВОЁ событие с afterEl. ВСЮ остальную работу делает этот скрипт
// сам: по id находит JSON-файл в system/templates/ с ИМЕНЕМ, равным этому id, грузит из него список
// шаблонов, отрисовывает (через templateView.js) и сам вставляет/убирает результат — решает это по
// СВОЕМУ состоянию (открыт список сейчас или нет), а не по указке того, кто прислал событие.
// Один и тот же код на любой глубине — добавить ещё один уровень вложенности = дописать сюда id
// и завести под него JSON-файл, ничего больше менять не нужно.
const TEMPLATE_LIST_IDS = [
  "visualStyleEvent", "referenceEvent", "shotEvent", "soundsEvent", "musicEvent",
  "shotPerson", "shotOutfit", "shotLink", "shotFrame", "shotPhoto", "shotCamera", "shotClock", "shotChat",
];

const cache = new Map(); // id -> Promise<список шаблонов> — не грузим один и тот же файл повторно
function loadTemplates(id) {
  if (!cache.has(id)) {
    cache.set(id, fetch(new URL(`./templates/${id}.json`, import.meta.url)).then((r) => r.json()));
  }
  return cache.get(id);
}

function buildTemplateList(templates, blockId) {
  const box = el("div", "display:flex;flex-direction:column;gap:6px;margin-left:18px;");
  buildTemplateViews(templates, blockId).forEach((row) => box.append(row));

  // «Создать новый шаблон» — плоская кнопка, сама ничего не рисует, только шлёт createTemplate
  // (ловит templateView.js — та же форма, что и для редактирования, просто пустая).
  const createBtn = btn("+ Создать новый шаблон", "border-style:dashed;background:transparent;");
  createBtn.onclick = () => emit("createTemplate", { afterEl: createBtn, blockId });
  box.append(createBtn);

  return box;
}

// Ищет шаблон по ссылке во всех уже загруженных списках и вырезает его из массива —
// нужно templateRegistry.js для удаления по id/ссылке.
async function removeTemplate(template) {
  for (const promise of cache.values()) {
    const list = await promise;
    const idx = list.indexOf(template);
    if (idx !== -1) {
      list.splice(idx, 1);
      return true;
    }
  }
  return false;
}

// Находит шаблон по id во всех уже загруженных списках и обновляет заголовок/контент.
// Не нашли (новый шаблон, id ещё нет) — создаём новую запись и кладём её в список blockId.
async function saveTemplate({ id, title, content, blockId }) {
  if (id !== undefined) {
    for (const promise of cache.values()) {
      const list = await promise;
      const found = list.find((t) => t.id === id);
      if (found) {
        found.name = title;
        found.text = content;
        return found;
      }
    }
  }
  const list = await loadTemplates(blockId);
  const created = { id: `tpl_${Date.now().toString(36)}`, name: title, text: content };
  list.push(created);
  return created;
}

// Сбрасывает состояние «что сейчас развёрнуто» — вызывается при backToMenu, когда список блоков
// (а вместе с ним и все вставленные шаблоны) уже стёрт снаружи (addBlockListBuilder.clear()).
// Без этого TemplateBuilder думал бы, что старые списки всё ещё вставлены, хотя их DOM уже нет.
function reset() {
  inserted.clear();
}

// Живое обновление: если список этого blockId сейчас показан — перерисовывает его заново на
// месте (тот же box, свежее содержимое из уже изменённого массива в кэше). Если не показан —
// ничего не делает, обновлять нечего. Вызывается после saveTemplate/удаления.
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

// Для удаления: не всегда известно, какому blockId принадлежал шаблон, — обновляем все сейчас
// показанные списки разом, дёшево (их обычно один-два одновременно открыто).
async function refreshAll() {
  await Promise.all([...inserted.keys()].map(refresh));
}

export const TemplateBuilder = { loadTemplates, buildTemplateList, removeTemplate, saveTemplate, reset, refresh, refreshAll };

const inserted = new Map(); // id -> вставленный сейчас элемент списка шаблонов (или его нет)

TEMPLATE_LIST_IDS.forEach((id) => {
  on(id, async ({ afterEl } = {}) => {
    const shown = inserted.get(id);
    if (shown) {
      shown.remove();
      inserted.delete(id);
      return;
    }
    const templates = await loadTemplates(id);
    const box = buildTemplateList(templates, id);
    afterEl?.after(box);
    inserted.set(id, box);
  });
});

on("backToMenu", () => TemplateBuilder.reset());
