import { createStore } from "../lib/templateStore.js";
import { userFileBackend } from "../lib/serverBackend.js";

// Сохранённые персонажи: создаются в Scene Builder, используются в Prompt Blocks (пункт «Персонаж» в шоте).
// Общий файл user/<пользователь>/PromptBlocks/characters.json — так ноды не зависят друг от друга.
export const characterStore = createStore(userFileBackend("PromptBlocks/characters.json"));
characterStore.load();
