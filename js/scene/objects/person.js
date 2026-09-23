import { el, btn, row, card, segmented, CARD_COLORS } from "../../lib/dom.js";
import { saveTemplateView } from "../saveTemplate.js";
import { characterStore } from "../../shared/characters.js";
import { outfitStore } from "../../shared/outfits.js";
import { ATTRIBUTES } from "../attributes.js";
import { renderAttribute } from "../attributeRow.js";
import { renderClothes } from "../clothingSection.js";
import { isAdult } from "../rules.js";
import { article, andList } from "../phrase.js";

const GENDER_RU = { female: "Женщина", male: "Мужчина" };
const newPerson = (gender) => ({ kind: "person", gender, age: 30, attrs: {}, clothes: [], facing: "" });

// Ориентация к зрителю — модель хорошо понимает такие формулировки.
const FACING = [["", "—"], ["front", "Анфас"], ["profile", "В профиль"], ["back", "Спиной"]];
const FACING_PHRASE = { front: "facing the viewer", profile: "in profile", back: "with the back to the viewer" };

// Убирает то, что недоступно по возрасту (набор «телосложение», бельё и т.п.).
function enforceAge(p) {
  if (isAdult(p)) return;
  ATTRIBUTES.filter((a) => a.adultOnly).forEach((a) => delete p.attrs[a.key]);
  p.clothes = p.clothes.filter((c) => c.adult !== "18+" && c.cat !== "underwear");
}

// Фраза про одежду: «wearing red shirt and black skirt» (пустая строка, если одежды нет).
const outfitPhrase = (p) => {
  const clothes = p.clothes.map((c) => [c.color, c.text].filter(Boolean).join(" ").trim()).filter(Boolean);
  return clothes.length ? `wearing ${andList(clothes)}` : "";
};

const noun = (p) => (isAdult(p) ? (p.gender === "female" ? "woman" : "man") : p.gender === "female" ? "girl" : "boy");

export const personObject = {
  kind: "person",
  menu: {
    icon: "person", label: "Человек",
    children: [
      { label: "Женщина", make: () => newPerson("female") },
      { label: "Мужчина", make: () => newPerson("male") },
    ],
  },

  render(p, i, ctx) {
    enforceAge(p);
    const body = [];

    const age = el("input", "width:70px;box-sizing:border-box;");
    age.type = "number"; age.min = "1"; age.max = "100";
    age.value = p.age;
    age.addEventListener("input", () => { p.age = Number(age.value) || 0; ctx.save(); });
    age.addEventListener("change", () => ctx.rerender()); // пересчитать доступные наборы
    body.push(row(el("span", "min-width:110px;", "Возраст:"), age, el("span", "", "лет")));

    ATTRIBUTES.filter((a) => !a.adultOnly || isAdult(p)).forEach((a) => body.push(renderAttribute(a, p, ctx)));
    body.push(row(el("span", "min-width:110px;", "Ориентация:"), segmented(p, "facing", FACING, ctx)));
    body.push(renderClothes(p, ctx));
    const save = btn("Сохранить как персонажа");
    save.onclick = () => ctx.openView(saveTemplateView({
      store: characterStore, compileText: () => personObject.compile(p),
      namePlaceholder: "Имя персонажа (например: Аня в клетчатой рубашке)", saveLabel: "Сохранить персонажа",
    }));
    const saveOutfit = btn("Сохранить образ (только одежда)");
    saveOutfit.onclick = () => ctx.openView(saveTemplateView({
      store: outfitStore, compileText: () => outfitPhrase(p),
      namePlaceholder: "Название образа (например: Клетчатая рубашка и чёрная юбка)", saveLabel: "Сохранить образ",
    }));
    body.push(save, saveOutfit);

    return card(GENDER_RU[p.gender], ctx.getState(), i, ctx, body, {
      sameKind: true, color: CARD_COLORS.ref, icon: "person", summary: `${p.age} лет`,
    });
  },

  compile(p) {
    enforceAge(p);
    const sel = (k) => (p.attrs[k]?.text || "").trim();
    const adj = ATTRIBUTES.filter((a) => a.slot === "adj").map((a) => sel(a.key)).filter(Boolean);
    const who = [p.age ? `${p.age}-year-old` : "", ...adj, noun(p)].filter(Boolean).join(" ");

    const hair = [sel("hair_style"), sel("hair_color")].filter(Boolean).join(" ");
    const details = [hair && `${hair} hair`, sel("eyes") && `${sel("eyes")} eyes`, sel("skin") && `${sel("skin")} skin`].filter(Boolean);

    let s = `${article(who)} ${who}`;
    if (details.length) s += ` with ${andList(details)}`;
    if (outfitPhrase(p)) s += `, ${outfitPhrase(p)}`;
    if (sel("pose")) s += `, ${sel("pose")}`;
    if (FACING_PHRASE[p.facing]) s += `, ${FACING_PHRASE[p.facing]}`;
    return s;
  },
};
