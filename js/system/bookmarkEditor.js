import { on } from "./eventBus.js";
import { TemplateBuilder } from "./templateBuilder.js";

let bookmarks = [];
let readyPromise = null;

async function walk(id) {
  const list = await TemplateBuilder.loadTemplates(id).catch(() => []);
  for (const entry of list) {
    if (entry.category) await walk(entry.id);
    else if (entry.bookmarked) bookmarks.push(entry);
  }
}

async function refresh() {
  bookmarks = [];
  await walk("templateClickBlocks");
}

export function getBookmarks() {
  return bookmarks;
}

export function ready() {
  return readyPromise;
}

export function subscribe() {
  on("template:bookmark", ({ template, blockId } = {}) => {
    if (!template) return;
    template.bookmarked = !template.bookmarked;
    if (blockId) TemplateBuilder.persist(blockId);
    readyPromise = refresh();
  });
  readyPromise = refresh();
}
