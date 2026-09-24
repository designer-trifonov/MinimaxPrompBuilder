// Реестр блоков верхнего уровня. Порядок здесь = порядок в меню «Добавить блок».
// Новый блок: создай файл в blocks/ (BlockBuilder: type, build, menu, render, compile) и добавь в список.
// Блоки с одинаковым group собираются в одну кнопку с подпунктами (см. GROUPS).
import { ImageRefBlockBuilder } from "./imageRef.js";
import { LastRefBlockBuilder } from "./lastRef.js";
import { FirstLastRefBlockBuilder } from "./firstLastRef.js";
import { RefBlockBuilder } from "./refImage.js";
import { StyleBlockBuilder } from "./style.js";
import { ShotBlockBuilder } from "./shot.js";
import { SoundBlockBuilder } from "./sound.js";
import { MusicBlockBuilder } from "./music.js";

const GROUPS = { ref: { icon: "📎", label: "Референс" } };

export const BLOCK_LIST = [
  StyleBlockBuilder, ImageRefBlockBuilder, LastRefBlockBuilder, FirstLastRefBlockBuilder, RefBlockBuilder,
  ShotBlockBuilder, SoundBlockBuilder, MusicBlockBuilder,
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
