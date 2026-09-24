import "./iconRegistry.js";
import "./templateEditor.js";
import { MainMenuBuilder } from "./mainMenuBuilder.js";
import { subscribe } from "./templateBuilder.js";

subscribe();

export function initNode() {
  return MainMenuBuilder.init();
}
