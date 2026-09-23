import { el, row, card, textArea, textInput, segmented, chipToggle, CARD_COLORS } from "../lib/dom.js";
import { ROLE_DEFS_BY_MEDIA, roleList, defsFor, makeRef, ownTag, kindOf, noteFor, retextNoun } from "./refImageRoles.js";

// Референс (reference-to-video): определение субъекта + маркер сохранения (retention).
// Референс бывает с картинки (<Picture N>) или с видео (<Video N>) — media у блока, задаётся
// один раз при создании и дальше не меняется (какой тег носителя достался, такой и есть).
// Все такие блоки собираются в разделы subject_definitions и retention_analysis (официальный формат).
// Роли, режимы и тексты для промпта — в refImageRoles.js (данные и чистая логика, без DOM).

export { makeRef }; // связь референсов (items/interaction.js) заводит недостающие ref-блоки этой же функцией

const TAG_RE = /<(Subject|Picture|Video) (\d+)>/;

// Шоты, где субъект упоминается в тексте элементов (для строки «appears in»).
function shotsWith(tag, state) {
  const found = [];
  state.filter((b) => b.type === "shot").forEach((shot, i) => {
    if (JSON.stringify(shot.items).includes(tag)) found.push(`[Shot ${i + 1}]`);
  });
  return found;
}

// Следующие номера для нового референса: <Subject n> — сквозной по всем референсам,
// <Picture refN>/<Video refN> — свой счётчик у каждого носителя.
function nextNumbers(ctx, media) {
  const refs = ctx.getState().filter((b) => b.type === "ref");
  const subjectN = refs.length + 1;
  const refN = refs.filter((b) => (b.media || "picture") === media).length + 1;
  return { subjectN, refN };
}

// Пункты меню «Добавить блок» для одного media (список ролей превращается в лист меню).
const mediaMenuChildren = (media) =>
  roleList(media).map((r) => ({
    label: r.label,
    make: (ctx) => {
      const { subjectN, refN } = nextNumbers(ctx, media);
      return makeRef(subjectN, r.kind, media, refN);
    },
  }));

export const refImageBlock = {
  type: "ref",
  group: "ref",
  menu: {
    icon: "ref",
    label: "Референс (reference-to-video)",
    children: [
      { label: "🖼 Из картинки", children: mediaMenuChildren("picture") },
      { label: "🎬 Из видео", children: mediaMenuChildren("video") },
    ],
  },

  render(b, i, ctx) {
    const media = b.media || "picture"; // старые блоки без media — всегда картиночные
    const preview = el("div", "font-size:12px;opacity:.85;white-space:pre-wrap;");
    const updatePreview = () => { preview.textContent = `→ ${ownTag(b) || "<Subject ?>"}: ${b.retention} - ${noteFor(b)}`; };
    const save = () => { ctx.save(); updatePreview(); };

    kindOf(b); // на старых блоках без b.kind — определяет и проставляет его по тексту, один раз

    // Что на референсе: можно менять и после создания, но только в пределах своего носителя —
    // картинка не может вдруг стать «Движением», у неё нет видеоряда для этого.
    const kindRow = segmented(b, "kind", roleList(media).map((r) => [r.kind, r.label]), ctx, {
      compact: true,
      onChange: (kind) => {
        const r = ROLE_DEFS_BY_MEDIA[media][kind];
        retextNoun(b, r.noun);
        b.retention = r.options[0][0];
        b.note = ""; b.to = "";
        ctx.rerender();
      },
    });

    const retentionBox = el("div");
    const renderRetention = () => {
      retentionBox.innerHTML = "";
      const options = defsFor(b)[kindOf(b)].options.map(([v, label]) => [v, label]);
      retentionBox.append(segmented(b, "retention", options, ctx, {
        compact: true,
        onChange: () => { b.note = ""; renderExtra(); save(); },
      }));
    };
    renderRetention();

    const extraBox = el("div", "display:flex;flex-direction:column;gap:4px;");
    function renderExtra() {
      extraBox.innerHTML = "";
      // «Переносим на» — только для переноса признаков: без этого модели пришлось бы гадать,
      // на кого именно; список — другие референсы этой же сцены (любого носителя), без хардкода ролей.
      if (b.retention === "attribute_transfer") {
        const others = ctx.getState().filter((x) => x !== b && x.type === "ref").map(ownTag).filter(Boolean);
        const targets = others.length
          ? chipToggle(others, { selected: () => b.to, onPick: (tag) => { b.to = b.to === tag ? "" : tag; save(); } })
          : el("span", "opacity:.6;font-size:12px;", "нет других референсов — добавь ещё один");
        extraBox.append(row(el("span", "min-width:110px;", "Переносим на:"), targets));
      } else if (b.to) {
        b.to = "";
      }
      extraBox.append(row(el("span", "", "Пояснение:"), textInput(b, "note", { save }, "100%")));
    }
    renderExtra();

    updatePreview();
    const title = media === "video" ? "Референс-видео" : "Референс-картинка";
    return card(title, ctx.getState(), i, ctx, [
      textArea(b, ctx),
      row(el("span", "min-width:110px;", "Что на референсе:"), kindRow),
      row(el("span", "", "Что делаем:"), retentionBox),
      extraBox,
      preview,
    ], { sameKind: true, color: CARD_COLORS.ref, icon: "ref", summary: defsFor(b)[kindOf(b)].label });
  },

  // Один блок = строка определения (используется, если группа не собирается целиком).
  compile: (b) => (b.text || "").trim(),

  // Все референс-блоки вместе (картинки и видео): subject_definitions + retention_analysis.
  compileGroup(blocks, state) {
    const defs = blocks.map((b) => (b.text || "").trim()).filter(Boolean);
    if (!defs.length) return "";
    const retention = blocks.map((b) => {
      const m = (b.text || "").match(TAG_RE);
      if (!m) return "";
      const tag = m[0];
      const shots = shotsWith(tag, state);
      const appears = shots.length ? ` (appears in ${shots.join(", ")})` : "";
      return `${tag}${appears}: ${b.retention || "fully_preserved"} - ${noteFor(b)}`;
    }).filter(Boolean);
    return [
      `subject_definitions:\n${defs.join("\n")}`,
      retention.length ? `retention_analysis:\n${retention.join("\n")}` : "",
    ].filter(Boolean).join("\n\n");
  },
};
