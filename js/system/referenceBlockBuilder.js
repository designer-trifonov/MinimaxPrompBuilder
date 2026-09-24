import { on, emit } from "./eventBus.js";
import { TemplateBuilder } from "./templateBuilder.js";
import { buildBlock } from "./blockBuilder.js";

on("templateClicked", async ({ id, blockId } = {}) => {
  if (!id?.startsWith("promptBlock") || !blockId) return;
  const templates = await TemplateBuilder.loadTemplates(blockId).catch(() => null);
  const template = templates?.find((t) => t.id === id);
  if (!template) return;

  const blockData = { id: template.id, blockId, title: template.name, text: template.text, icon: template.icon, color: template.color };
  const el = buildBlock(blockData);
  emit("promptBlock:add", { id: template.id, el, data: blockData });
  emit("promptBlock:update", { id: template.id, blockId, text: template.text });
});
