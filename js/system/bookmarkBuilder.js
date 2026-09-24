import { on } from "./eventBus.js";

// Единственная задача: поймать событие закладки от templateView.js ("template:bookmark", payload
// несёт сам объект шаблона — это та же ссылка, что уже лежит в загруженном списке TemplateBuilder,
// так что менять можно прямо на месте) и переключить у него булево поле bookmarked. Больше ничего
// не делает — ни поиска по реестрам, ни отрисовки, ни отдельного хранилища закладок.
on("template:bookmark", ({ template } = {}) => {
  if (!template) return;
  template.bookmarked = !template.bookmarked;
});
