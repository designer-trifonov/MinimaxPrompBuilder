// Мелкие помощники для сборки английских фраз.
export const article = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");

// ["a", "b", "c"] → "a, b and c"
export const andList = (items) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
