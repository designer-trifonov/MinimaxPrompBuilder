/*
import { el } from "../lib/dom.js";
import { THEME } from "../lib/theme.js";
import { emit } from "./eventBus.js";
import { buildBlockCardShell } from "./blockCardShell.js";
import { registerBlock } from "./promptBlockOrderManager.js";

let subjectCount = 0;
const refCountByMedia = { picture: 0, video: 0 };
let instanceCount = 0;

function mediaTag(media, n) {
  return media === "video" ? `<Video ${n}>` : `<Picture ${n}>`;
}

export function buildReferencePromptBlockView(roleEntry) {
  const id = `referenceEvent_${++instanceCount}`;
  const media = roleEntry.media === "video" ? "video" : "picture";
  const subjectN = ++subjectCount;
  const refN = ++refCountByMedia[media];

  const color = THEME.category.ref;
  const content = el("div", "display:flex;flex-direction:column;gap:6px;min-width:0;");

  const textArea = el("textarea", "width:100%;box-sizing:border-box;resize:vertical;");
  textArea.rows = 2;
  textArea.value = `<Subject ${subjectN}> is the ${roleEntry.name.toLowerCase()} in ${mediaTag(media, refN)}, featuring `;
  content.append(textArea);

  const update = () => emit("promptBlock:update", { id, blockId: "referenceEvent", text: textArea.value });
  textArea.addEventListener("input", update);
  update();

  registerBlock(id, buildBlockCardShell(id, `<Subject ${subjectN}> — ${roleEntry.name}`, color, content));
}

export function resetReferenceCounters() {
  subjectCount = 0;
  refCountByMedia.picture = 0;
  refCountByMedia.video = 0;
}

*/
