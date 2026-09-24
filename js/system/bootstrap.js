// Точка входа новой системы. Все остальные скрипты сами подписываются на eventBus при загрузке
// модуля (никого вручную подписывать не нужно) — здесь только подключаем их (side-effect импорт,
// чтобы их on(...) успели зарегистрироваться) и инициализируем главное меню ноды.
import "./iconRegistry.js";
import "./promptBlockOrderManager.js";
import "./addBlockListBuilder.js";
import "./blockView.js";
import "./templateBuilder.js";
import "./templateView.js";
import "./bookmarkBuilder.js";
import "./templateEditor.js";
import "./genericBlockBuilder.js";
import "./shotBlockBuilder.js";
import "./referenceBlockBuilder.js";
import "./promptCompiler.js";
import { MainMenuBuilder } from "./mainMenuBuilder.js";

// Создаёт главное меню ноды (панель Добавить блок/Копировать/Шаблон/Сбросить всё) — то, что
// нода должна показать при инициализации.
export function initNode() {
  return MainMenuBuilder.init();
}
