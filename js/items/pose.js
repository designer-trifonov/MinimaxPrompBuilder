import { el, row, textInput, textArea, segmented } from "../lib/dom.js";
import { groupedTemplateEntries } from "../lib/templates.js";
import { attrStores } from "../scene/stores.js";

// Поза персонажа в шоте: «<Subject N> is standing, ...», или, если включён POV — «Camera: ...
// We see in front of us: <Subject N>, standing, ...». Оба варианта — ОДНО предложение, ОДИН элемент
// шота (элементы шота не склеиваются друг с другом, каждый — отдельное предложение, см. shot.js) —
// поэтому POV сделан переключателем здесь, а не отдельным элементом «Описание кадра».
// Список поз общий со Scene Builder (attrStores.pose = scene_poses.json), см. attributes.js.
const poseStore = attrStores.pose;
// «off-screen male viewer» — минимально необходимая часть, чинит баг «камера от лица субъекта»
// (без неё модель приписывает POV ближайшему названному персонажу). Короче не делать.
const povPrefix = () => `Camera: first-person point of view ("POV") of an off-screen male viewer. We see in front of us:`;

// Кого ставим в позу по умолчанию: есть референс-блоки → <Subject 1>, иначе просто «the person».
const defaultSubject = (ctx) => {
  const state = ctx?.getState?.() ?? [];
  return state.some((b) => b.type === "ref") ? "<Subject 1>" : "the person";
};
// t.pov в самом шаблоне — для поз, которые ты всегда используешь с POV (например, часто юзаемые):
// не нужно каждый раз вручную щёлкать тумблер, шаблон сам включает его.
const make = (t, ctx) => ({ t: "pose", name: t.name, who: defaultSubject(ctx), text: t.text, pov: !!t.pov });

export const poseItem = {
  t: "pose",
  icon: "person",
  menu: {
    icon: "person", label: "Поза",
    children: () => [
      ...groupedTemplateEntries(poseStore, {
        make,
        newLabel: "Новая поза (вручную)", saveLabel: "Сохранить позу",
        namePlaceholder: "Название позы",
        textPlaceholder: "Поза по-английски (например: sitting on a chair)",
      }),
      { label: "Пустой элемент", make: (ctx) => make({ name: "Поза", text: "" }, ctx) },
    ],
  },
  title: (it) => `Поза: ${it.name ?? ""}${it.pov ? " (POV)" : ""}`,
  body: (it, ctx) => [
    row(el("span", "", "Субъект:"), textInput(it, "who", ctx, "150px")),
    row(el("span", "", "Камера:"), segmented(it, "pov", [[false, "Обычно"], [true, "POV"]], ctx)),
    textArea(it, ctx, 2),
  ],
  compile: (it) => {
    const text = (it.text || "").trim();
    const who = (it.who || "").trim();
    if (!text) return "";
    return it.pov ? `${povPrefix()} ${who}, ${text}` : `${who} is ${text}`;
  },
};
