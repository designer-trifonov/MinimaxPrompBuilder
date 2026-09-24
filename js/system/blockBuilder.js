import { emit } from "./eventBus.js";
import { renderBlock } from "./blockView.js";

export function buildBlock(block) {
  return renderBlock(block, {
    onPillSelect: (template, repaint) => {
      block.id = template.id;
      block.title = template.name;
      block.text = template.text;
      block.icon = template.icon;
      block.color = template.color;
      repaint();
      emit("promptBlock:update", { id: block.id, blockId: block.blockId, text: block.text });
    },
    onAction: (action) => emit("promptBlock:action", { id: block.id, action }),
  });
}
