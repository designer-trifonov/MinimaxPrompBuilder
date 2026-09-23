// Реестр блоков верхнего уровня. Порядок здесь = порядок в меню «Добавить блок».
// Новый блок: создай файл в blocks/ (type, menu, render, compile) и добавь в список.
// Блоки с одинаковым group собираются в одну кнопку с подпунктами (см. GROUPS).
import { imageRefBlock } from "./imageRef.js";
import { lastRefBlock } from "./lastRef.js";
import { firstLastRefBlock } from "./firstLastRef.js";
import { refImageBlock } from "./refImage.js";
import { styleBlock } from "./style.js";
import { shotBlock } from "./shot.js";
import { soundBlock } from "./sound.js";
import { musicBlock } from "./music.js";

const GROUPS = { ref: { icon: "📎", label: "Референс" } };

export const BLOCK_LIST = [
  styleBlock, imageRefBlock, lastRefBlock, firstLastRefBlock, refImageBlock,
  shotBlock, soundBlock, musicBlock,
];
export const BLOCKS = Object.fromEntries(BLOCK_LIST.map((b) => [b.type, b]));

function buildMenu(blocks) {
  const menu = [];
  const groups = {};
  for (const b of blocks) {
    if (!b.group) { menu.push(b.menu); continue; }
    if (!groups[b.group]) {
      groups[b.group] = { ...GROUPS[b.group], children: [] };
      menu.push(groups[b.group]);
    }
    groups[b.group].children.push({ ...b.menu, icon: undefined });
  }
  return menu;
}
export const TOP_MENU = buildMenu(BLOCK_LIST);
