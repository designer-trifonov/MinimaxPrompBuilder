import { on } from "./eventBus.js";
import { TemplateBuilder } from "./templateBuilder.js";

on("saveTemplate", async ({ id, title, content, blockId } = {}) => {
  await TemplateBuilder.saveTemplate({ id, title, content, blockId });
  await TemplateBuilder.refresh(blockId);
});

on("template:delete", async ({ template } = {}) => {
  if (!template || template.default) return;
  await TemplateBuilder.removeTemplate(template);
  await TemplateBuilder.refreshAll();
});
