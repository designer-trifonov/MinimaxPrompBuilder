// Реестр объектов сцены. Новый объект: создай файл (kind, menu, render, compile) и добавь сюда.
import { PersonBlockBuilder } from "./person.js";

export const OBJECT_LIST = [PersonBlockBuilder];
export const OBJECTS = Object.fromEntries(OBJECT_LIST.map((o) => [o.kind, o]));
export const OBJECT_MENU = OBJECT_LIST.map((o) => o.menu);
