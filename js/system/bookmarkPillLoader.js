import { THEME } from "../lib/theme.js";
import { TemplateBuilder } from "./templateBuilder.js";

// Проходит по всем реестрам шаблонов, собирает те, где bookmarked === true, отдаёт готовый
// список для отрисовки пилюль {id, name, text, color}. Цвет — свой у шаблона (template.color),
// если задан, иначе цвет категории блока (THEME.category).
const BLOCK_EVENT_IDS = ["visualStyleEvent", "referenceEvent", "shotEvent", "soundsEvent", "musicEvent"];
const CATEGORY_KEY = { visualStyleEvent: "style", referenceEvent: "ref", shotEvent: "shot", soundsEvent: "sound", musicEvent: "music" };

export async function loadBookmarkedPills() {
  const lists = await Promise.all(BLOCK_EVENT_IDS.map((id) => TemplateBuilder.loadTemplates(id)));
  const pills = [];
  lists.forEach((templates, i) => {
    const blockId = BLOCK_EVENT_IDS[i];
    templates.filter((t) => t.bookmarked).forEach((t) => {
      pills.push({
        id: t.id,
        name: t.name,
        text: t.text ?? "",
        color: t.color || THEME.category[CATEGORY_KEY[blockId]] || THEME.accent,
      });
    });
  });
  return pills;
}
