import { ATTRIBUTES_DATA } from "./attributes.js";
import { on } from "../system/eventBus.js";

// Билдеры пунктов «атрибут человека» (Рост/Телосложение/Причёска/Цвет волос/Глаза/Кожа/Поза) —
// по одному на attr.key, все одинаковой формы (шаблон → {name,text}), но регистрируются отдельно
// под своим id, а не одной общей функцией на всех. Рендер — scene/attributeRow.js, данные — attributes.js.
ATTRIBUTES_DATA.forEach((attr) => {
  function attributeBlockBuilder({ payload, resolve }) {
    resolve(payload?.template ? { name: payload.template.name, text: payload.template.text } : null);
  }
  on(attr.key, attributeBlockBuilder);
});
