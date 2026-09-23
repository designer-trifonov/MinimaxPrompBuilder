// Доп. поля формы шаблона и правила доступности (пол, возраст). Общие для атрибутов и одежды.
export const FOR_FIELD = {
  key: "for", label: "Для:",
  options: [["any", "Всех"], ["female", "Женщин"], ["male", "Мужчин"]],
};
export const ADULT_FIELD = {
  key: "adult", label: "Возраст:",
  options: [["all", "Любой"], ["18+", "18+"]],
};
export const TEMPLATE_FIELDS = [FOR_FIELD, ADULT_FIELD];

export const ADULT_AGE = 18;
export const isAdult = (person) => Number(person.age) >= ADULT_AGE;

// Шаблон доступен человеку: подходит по полу и по возрасту.
export const allowed = (tpl, person) =>
  (!tpl.for || tpl.for === "any" || tpl.for === person.gender) &&
  (tpl.adult !== "18+" || isAdult(person));
