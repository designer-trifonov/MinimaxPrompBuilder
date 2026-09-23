// Реестр объектов сцены. Новый объект: создай файл (kind, menu, render, compile) и добавь сюда.
import { personObject } from "./person.js";

export const OBJECT_LIST = [personObject];
export const OBJECTS = Object.fromEntries(OBJECT_LIST.map((o) => [o.kind, o]));
export const OBJECT_MENU = OBJECT_LIST.map((o) => o.menu);
