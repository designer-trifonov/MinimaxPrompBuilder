import { el, btn } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit, on } from "./eventBus.js";
import { loadBookmarkedPills } from "./bookmarkPillLoader.js";
import { buildBookmarkPillViews } from "./bookmarkPillView.js";

// Билдер базовых элементов главного меню — того, что постоянно находится на самой ноде
// (не список блоков, а сама панель: тулбар «Добавить блок»/«Копировать»/«Шаблон»/«Сбросить всё»).
// init() создаёт кнопки (текст+дизайн из THEME) и вешает по клику ОБЕЗЛИЧЕННОЕ событие в eventBus —
// сама кнопка не знает и не делает никакой бизнес-логики, просто сообщает «нажали X» по id.
// Реальную логику (что делать по каждому событию) навешивает тот, кто подписан через on(id, ...).
export const MainMenuBuilder = {
  init() {
    const root = el("div", "display:flex;flex-direction:column;gap:6px;");

    // Лента пилюль-закладок — сверху, для удобства (быстрая вставка без похода в меню блоков).
    const pillsRow = el("div", "display:flex;flex-wrap:wrap;gap:6px;");
    loadBookmarkedPills().then((pills) => {
      pillsRow.innerHTML = "";
      buildBookmarkPillViews(pills).forEach((pill) => pillsRow.append(pill));
      pillsRow.style.display = pills.length ? "flex" : "none";
    });
    root.append(pillsRow);

    const bar = el("div", "display:flex;gap:6px;");
    const addBtn = btn("+ Добавить блок", "flex:2;", THEME.heights.addBlock);
    const copyBtn = btn("Копировать", "flex:1;", THEME.heights.copy);
    const presetBtn = btn("📋 Шаблон", "flex:1;", THEME.heights.template);
    bar.append(addBtn, copyBtn, presetBtn);

    // Отдельной строкой снизу — реже нужна и необратима (сносит весь набор блоков), поэтому
    // не смешана с основной панелью и подкрашена предупреждающим цветом (как «выкл» у LoRA Guide).
    const resetBtn = btn(
      "Сбросить всё",
      `background:${THEME.status.resetBg};border-color:${THEME.status.resetBorder};color:${THEME.status.offText};`,
      THEME.heights.resetAll
    );

    // Четыре события: "addBlock", "copy", "template", "resetAll" — по одному на кнопку.
    addBtn.onclick = () => emit("addBlock", {});
    copyBtn.onclick = () => emit("copy", {});
    presetBtn.onclick = () => emit("template", {});
    resetBtn.onclick = () => emit("resetAll", {});

    root.append(bar, resetBtn);
    return { root, bar, addBtn, copyBtn, presetBtn, resetBtn, pillsRow };
  },
};

// «Назад» из списка блоков стёр себя и попросил показать главное меню — пересобираем панель заново.
on("showMainMenu", ({ resolve } = {}) => resolve?.(MainMenuBuilder.init()));
