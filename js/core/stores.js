import { createStore } from "../lib/templateStore.js";
import { userFileBackend } from "../lib/serverBackend.js";

// Пользовательские шаблоны. Файлы лежат в user/<пользователь>/PromptBlocks/.
const make = (file) => {
  const store = createStore(userFileBackend(`PromptBlocks/${file}.json`));
  store.load();
  return store;
};

export const styleStore = make("styles");
export const cameraStore = make("cameras");
export const soundStore = make("sounds");
export const musicStore = make("music");
export const interactionStore = make("interactions");
export const frameStore = make("frames");
export const dialogStore = make("dialogs");
export const refTemplateStore = make("ref_templates");
export const shotDescStore = make("shot_descriptions");
export const weActionStore = make("we_actions");
