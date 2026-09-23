import { OBJECTS } from "./objects/index.js";

// Каждый объект собирает свою фразу; сцена — это фразы через пустую строку.
export const compileScene = (state) =>
  state.map((o) => OBJECTS[o.kind]?.compile(o)).filter(Boolean).join("\n\n");
