import "./iconRegistry.js";
import "./templateEditor.js";
import "./cursorTracker.js";
import "./referenceCounter.js";
import "./referenceBlockBuilder.js";
import "./promptBlockOrderManager.js";
import "./promptCompiler.js";
import { MainMenuBuilder } from "./mainMenuBuilder.js";
import { subscribe as subscribeTemplateBuilder } from "./templateBuilder.js";
import { subscribe as subscribeBookmarkEditor } from "./bookmarkEditor.js";

subscribeTemplateBuilder();
subscribeBookmarkEditor();

export function initNode() {
  return MainMenuBuilder.init();
}
