// Данные и чистая логика референса: что бывает на референсе (роль), какие у неё варианты
// «Что делаем» и какой английский текст уходит в промпт для каждого. Никакого DOM — этим занимается
// refImage.js. Разнесено отдельно, чтобы список ролей/вариантов можно было менять и расширять,
// не трогая код отрисовки.
//
// Референс бывает двух видов носителя (media): "picture" (<Picture N>) и "video" (<Video N>).
// У каждого носителя свой набор ролей (kind) — то, что вообще можно взять с картинки (человек,
// одежда, предмет...) отличается от того, что можно взять с видео (движение, герой, стиль, вся сцена).
// kind — стабильный внутренний ключ роли внутри своего media. Он НЕ равен тексту, который видит
// модель (noun) — noun можно свободно менять словами, а kind остаётся тем же ключом, по которому
// подбираются варианты «Что делаем» и по которому связь референсов (items/interaction.js) узнаёт роль.

export const PICTURE_ROLE_DEFS = {
  person: {
    label: "Человек", noun: "person",
    options: [
      ["fully_preserved", "Внешность полностью", "all of the subject's facial features and body build are fully preserved from the reference"],
      ["weak_reference", "Общие черты внешности", "only broad traits are carried over from the reference — approximate age, build, and distinctive facial features such as jaw shape and eye shape; the exact face and identity are not copied"],
      ["partially_preserved", "Телосложение", "only the body's external shape (contour, proportions and build) is retained from the reference — not the pose; the face and outfit are not copied"],
    ],
  },
  outfit: {
    label: "Одежда", noun: "full outfit, from head to toe",
    options: [
      ["attribute_transfer", "Взять весь комплект одежды", "the entire outfit — every visible piece of clothing and footwear, top and bottom — is transferred onto the target subject, fully replacing all of their original clothing; the target subject's face, hair, and body are not altered — only their clothing changes"],
      ["weak_reference", "Только стиль одежды", "only the general style category and approximate color tone of the outfit are referenced as inspiration — not the exact garments, cut, or precise colors"],
    ],
  },
  object: {
    label: "Предмет", noun: "object",
    options: [
      ["attribute_transfer", "Взять и перенести", "the object, kept exactly as shown in the reference, is placed into the scene and naturally held or used by the target subject"],
      ["fully_preserved", "Оставить как в кадре", "the object is retained exactly as shown in the reference and placed naturally within the new scene"],
      ["weak_reference", "Только похожий предмет", "only the object's general category and shape are referenced (e.g. a similar kind of item) — not its exact design, color or material"],
    ],
  },
  environment: {
    label: "Помещение / фон", noun: "environment",
    options: [
      ["fully_preserved", "Фон полностью", "the environment (location, architecture, decor and lighting) is retained as shown in the reference, but reframed for the current shot; any people or objects visible in the reference photo are not included"],
      ["weak_reference", "Только атмосфера", "only the general mood, lighting and color tone of the location are referenced as inspiration — not its specific architecture or layout"],
    ],
  },
  other: {
    label: "Другое", noun: "...",
    options: [
      ["fully_preserved", "Сохранить полностью", "the subject is retained exactly as shown in the reference, including its shape, color and texture"],
      ["partially_preserved", "Сохранить частично", "the subject is retained, but some details are changed"],
      ["attribute_transfer", "Перенести признаки", "the referenced characteristics are transferred to a different subject"],
      ["weak_reference", "Только сходство", "only the general visual impression (rough shape and color) of the reference is retained — not its exact details"],
    ],
  },
};

export const VIDEO_ROLE_DEFS = {
  motion: {
    label: "Движение / хореография", noun: "motion and choreography",
    options: [
      ["fully_preserved", "Оставить как есть", "the exact motion, choreography and camera movement are retained as shown in the reference video"],
      ["attribute_transfer", "Перенести на другого", "the motion and choreography are transferred onto the target subject, replacing their original movement"],
    ],
  },
  character: {
    label: "Персонаж(и)", noun: "character",
    options: [
      ["fully_preserved", "Оставить как есть", "this character is retained exactly as shown in the reference video"],
      ["attribute_transfer", "Заменить на другого", "this character is replaced by the target subject, while the video's motion, camera and environment remain unchanged"],
    ],
  },
  style: {
    label: "Стиль и свет", noun: "visual style and lighting",
    options: [
      ["weak_reference", "Только атмосфера", "only the general lighting, color grading and atmosphere of the video are referenced"],
      ["attribute_transfer", "Перенести на сцену", "the lighting and color grading are transferred onto the new scene"],
    ],
  },
  structure: {
    label: "Структура сцены целиком", noun: "overall scene structure",
    options: [
      ["fully_preserved", "Использовать как базу", "the video's structure — motion, environment and characters — is used as the base for the new video"],
      ["partially_preserved", "База с заменами", "the video's structure is used as the base, but specific elements defined separately (e.g. the character) are changed"],
    ],
  },
};

export const ROLE_DEFS_BY_MEDIA = { picture: PICTURE_ROLE_DEFS, video: VIDEO_ROLE_DEFS };
export const defsFor = (b) => ROLE_DEFS_BY_MEDIA[b.media === "video" ? "video" : "picture"];

// Совместимость с местами, где раньше был только один (картиночный) набор ролей.
export const ROLE_DEFS = PICTURE_ROLE_DEFS;

export const roleList = (media) =>
  Object.entries(ROLE_DEFS_BY_MEDIA[media]).map(([kind, r]) => ({ kind, media, ...r }));
export const ROLE_LIST = roleList("picture"); // совместимость со старым импортом

export const SUBJECT_RE = /<Subject \d+>/;
const NOUN_RE = /is the (.+?) in <(?:Picture|Video) \d+>/;

// Тег носителя: <Picture n> для картинки, <Video n> для видео.
const mediaTag = (media, n) => (media === "video" ? `<Video ${n}>` : `<Picture ${n}>`);

// Новый референс № n (номер <Subject n>, сквозной по всем референсам) с заготовкой по типу
// (kind из ROLE_DEFS_BY_MEDIA[media]). refN — номер тега носителя (<Picture refN>/<Video refN>),
// он свой у картинок и у видео, независимо от n — если не передан, считаем refN === n
// (так и было раньше, пока референсы были только картиночные).
export const makeRef = (n, kind = "person", media = "picture", refN = n) => {
  const defs = ROLE_DEFS_BY_MEDIA[media] || PICTURE_ROLE_DEFS;
  const r = defs[kind] ?? defs[Object.keys(defs)[0]];
  const [retention] = r.options[0];
  // note оставляем пустым — noteFor() сама подставит дефолт для текущего типа+режима (defaultNote).
  return { type: "ref", kind, media, text: `<Subject ${n}> is the ${r.noun} in ${mediaTag(media, refN)}, featuring `, retention, note: "" };
};

// Собственный тег <Subject N> этого блока.
export const ownTag = (b) => ((b.text || "").match(SUBJECT_RE) || [])[0] || "";

// На старых сохранённых блоках (без kind) — угадываем тип по тексту, один раз. Видео-блоки
// всегда создаются уже с kind, так что угадывание нужно только старым картиночным блокам.
export function kindOf(b) {
  const defs = defsFor(b);
  if (b.kind && defs[b.kind]) return b.kind;
  const noun = ((b.text || "").match(NOUN_RE) || [])[1] || "";
  const guess = /outfit/i.test(noun) ? "outfit" : /environment/i.test(noun) ? "environment" : /object/i.test(noun) ? "object" : /person/i.test(noun) ? "person" : "other";
  b.kind = guess;
  return guess;
}

// Пояснение по умолчанию для текущего типа+режима, с уже подставленным адресатом переноса.
const defaultNote = (b) => (defsFor(b)[kindOf(b)].options.find(([v]) => v === b.retention) || [])[2] || "";
export const noteFor = (b) => {
  const base = (b.note || "").trim() || defaultNote(b);
  if (!b.to) return base;
  return base.includes(b.to) ? base : base.replace(/the target subject/gi, b.to);
};

// Меняет noun в уже написанном тексте на новый, не трогая остальное («featuring ...»).
export function retextNoun(b, noun) {
  b.text = (b.text || "").replace(NOUN_RE, (m, old) => m.replace(old, noun));
}
