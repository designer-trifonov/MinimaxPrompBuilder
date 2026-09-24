/*
import { TemplateBuilder } from "./templateBuilder.js";

const BLOCK_EVENT_IDS = ["visualStyleEvent", "referenceEvent", "shotEvent", "soundsEvent", "musicEvent"];
const CATEGORY_KEY = { visualStyleEvent: "style", referenceEvent: "ref", shotEvent: "shot", soundsEvent: "sound", musicEvent: "music" };
const CATEGORY_COLOR = { ref: "#4d7bf3", style: "#e0a53f", shot: "#4bbf8a", sound: "#b47ecf", music: "#cf7ea0" };
const ACCENT = "#4d7bf3";

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
        color: t.color || CATEGORY_COLOR[CATEGORY_KEY[blockId]] || ACCENT,
      });
    });
  });
  return pills;
}

*/
