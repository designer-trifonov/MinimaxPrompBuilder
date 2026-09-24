// Реестр элементов внутри шота. Чтобы добавить новый элемент — создай файл в items/
// (BlockBuilder: t, build, menu, title, body, compile) и добавь его в этот список.
import { FrameBlockBuilder } from "./frame.js";
import { ShotDescBlockBuilder } from "./shotDescription.js";
import { CameraBlockBuilder } from "./camera.js";
import { ActionBlockBuilder } from "./action.js";
import { DialogBlockBuilder } from "./dialog.js";
import { FreeBlockBuilder } from "./free.js";
import { CharacterBlockBuilder } from "./character.js";
import { OutfitBlockBuilder } from "./outfit.js";
import { InteractionBlockBuilder } from "./interaction.js";
// Поза (pose.js) больше не в меню шота — позы нужнее в Scene Builder (там и остаются,
// attrStores.pose / scene_poses.json не трогали). Здесь вместо неё — готовые «Описание кадра».

export const ITEM_LIST = [
  CharacterBlockBuilder, OutfitBlockBuilder, InteractionBlockBuilder, FrameBlockBuilder,
  ShotDescBlockBuilder, CameraBlockBuilder, ActionBlockBuilder, DialogBlockBuilder, FreeBlockBuilder,
];
export const ITEMS = Object.fromEntries(ITEM_LIST.map((i) => [i.t, i]));
export const SHOT_MENU = ITEM_LIST.map((i) => i.menu);
