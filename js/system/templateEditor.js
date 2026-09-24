import { on } from "./eventBus.js";
import { TemplateBuilder } from "./templateBuilder.js";

// Сам ловит и сохранение, и удаление шаблона — TemplateBuilder тут только хранитель (отдаёт
// методы), сам событий не слушает по этой части.

// Всё равно, откуда пришло — новый шаблон или отредактированный: всегда { id, title, content }.
// blockId нужен, только если id не найден (новый шаблон) — знать, в какой реестр его класть.
on("saveTemplate", async ({ id, title, content, blockId } = {}) => {
  await TemplateBuilder.saveTemplate({ id, title, content, blockId });
  await TemplateBuilder.refresh(blockId);
});

on("template:delete", async ({ template } = {}) => {
  if (!template || template.default) return; // дефолтные (встроенные категории) не удаляются
  await TemplateBuilder.removeTemplate(template);
  await TemplateBuilder.refreshAll();
});
