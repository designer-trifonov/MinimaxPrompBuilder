// Реестр элементов внутри шота. Чтобы добавить новый элемент — создай файл в items/
// (t, menu, title, body, compile) и добавь его в этот список.
import { frameItem } from "./frame.js";
import { shotDescItem } from "./shotDescription.js";
import { cameraItem } from "./camera.js";
import { actionItem } from "./action.js";
import { dialogItem } from "./dialog.js";
import { freeItem } from "./free.js";
import { characterItem } from "./character.js";
import { outfitItem } from "./outfit.js";
import { interactionItem } from "./interaction.js";
// poseItem (pose.js) больше не в меню шота — позы нужнее в Scene Builder (там и остаются,
// attrStores.pose / scene_poses.json не трогали). Здесь вместо неё — готовые «Описание кадра».

export const ITEM_LIST = [characterItem, outfitItem, interactionItem, frameItem, shotDescItem, cameraItem, actionItem, dialogItem, freeItem];
export const ITEMS = Object.fromEntries(ITEM_LIST.map((i) => [i.t, i]));
export const SHOT_MENU = ITEM_LIST.map((i) => i.menu);
