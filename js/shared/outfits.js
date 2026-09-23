import { createStore } from "../lib/templateStore.js";
import { userFileBackend } from "../lib/serverBackend.js";

// Сохранённые образы (только одежда, без человека): создаются в Scene Builder,
// применяются в Prompt Blocks к любому субъекту (например, к <Subject 1> из референса).
export const outfitStore = createStore(userFileBackend("PromptBlocks/outfits.json"));
outfitStore.load();
