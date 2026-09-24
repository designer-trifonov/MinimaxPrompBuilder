// Точка входа ноды LoRA Guide: справочник LoRA — не грузит их, только хранит настройки
// (сила, гайд/триггер-слова) и даёт включать/выключать/сворачивать для теста.
// Список LoRA берётся АВТОМАТИЧЕСКИ сканированием папки DEFAULT_LORA_DIR через API ComfyUI
// (/models/loras — тот же список, что видит стандартная нода LoraLoader), вручную ничего
// добавлять не нужно. Настройки (сила/гайд/вкл-выкл) хранятся в
// user/<пользователь>/PromptBlocks/loras.json — общие для всех нод LoRA Guide.
import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { el, btn, row, card, icon, CARD_COLORS, INPUT_CSS, PALETTE, stopKeysBubbling } from "./lib/dom.js";
import { THEME } from "./lib/theme.js";
import { loraStore } from "./core/stores.js";

// Папка с LoRA под MiniMax H3 — из неё автоматически тянется список файлов.
const DEFAULT_LORA_DIR = "C:\\Users\\desig\\ComfyUI-Shared\\models\\loras\\Mini Max H3";
const FOLDER_NAME = DEFAULT_LORA_DIR.split(/[\\/]/).pop(); // "Mini Max H3" — префикс в списке ComfyUI
const DEFAULT_STRENGTH = 1;

const fmtStrength = (v) => Number(v ?? 0).toFixed(2);
const prettyName = (file) => file.split(/[\\/]/).pop().replace(/\.(safetensors|ckpt|pt)$/i, "");
const fullPath = (file) => `${DEFAULT_LORA_DIR}\\${file.split(/[\\/]/).pop()}`;

// Метки режима («Ref2V», «I2V», «T2V» и т.п.) — свои, произвольные, пользователь заводит их сам
// под конкретную LoRA. Цвет — не ручной выбор, а стабильный хэш текста метки по общей палитре
// (PALETTE в lib/dom.js — та же, что теперь и у цветных шаблонов PromptBlocks): одна и та же
// метка везде получает один и тот же цвет, без своего UI для выбора цвета.
const tagColor = (tag) => {
  let h = 0;
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

// Сводка по включённым LoRA — идёт на выход ноды (текстом, для справки/копирования).
const summarize = (items) =>
  items
    .filter((l) => l.enabled)
    .map((l) => `${l.name || l.file || "?"}: ${l.file || "?"} @ ${fmtStrength(l.strength)}${l.guide ? ` — ${l.guide}` : ""}`)
    .join("\n");

// Список LoRA, которые ComfyUI уже знает (то же самое, что видит стандартная нода LoraLoader
// в выпадающем списке) — берём через /models/loras. Отфильтровываем только файлы из нужной папки.
async function fetchFolderFiles() {
  let files = [];
  try {
    const r = await api.fetchApi("/models/loras");
    files = r.ok ? await r.json() : [];
  } catch { files = []; }
  const prefix = `${FOLDER_NAME}\\`;
  return files.filter((f) => f.replace(/\//g, "\\").startsWith(prefix));
}

// turbo/lightning (шаго-дистилляция) всегда на полной силе 1.0 — иначе ломается ускорение.
// Это единственное, что известно достоверно без гуглинга под конкретные файлы; остальные LoRA
// пока на общем DEFAULT_STRENGTH, пока не проверены реальные рекомендации под каждую.
const isTurbo = (file) => /turbo|lightning|lightx2v/i.test(file);

// Синхронизирует хранилище со списком файлов в папке: заводит запись для новых файлов
// (сила по умолчанию — DEFAULT_STRENGTH, кроме turbo-LoRA — им всегда 1.0), ничего не удаляет
// и не трогает уже настроенные.
async function syncFromFolder() {
  const files = await fetchFolderFiles();
  const known = new Set(loraStore.list().map((l) => l.file));
  for (const f of files) {
    if (known.has(f)) continue;
    const strength = isTurbo(f) ? 1 : DEFAULT_STRENGTH;
    const guide = isTurbo(f) ? "Turbo/lightning LoRA — всегда на полной силе 1.0, иначе ломается эффект ускорения." : "";
    await loraStore.add(prettyName(f), "", {
      file: f, strength, defaultStrength: strength, guide, enabled: true,
    });
  }
}

app.registerExtension({
  name: "LoraGuide",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "LoraGuide") return;

    const onCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onCreated?.apply(this, arguments);
      const node = this;
      const W = (n) => node.widgets.find((w) => w.name === n);
      const lorasW = W("loras"), summaryW = W("summary");
      [lorasW, summaryW].forEach((w) => {
        w.hidden = true;
        w.options = { ...(w.options || {}), hidden: true };
        w.computeSize = () => [0, -4];
      });

      const root = el("div", "display:flex;flex-direction:column;gap:8px;width:100%;box-sizing:border-box;");
      const folderLabel = el("div", "font-size:11px;opacity:.6;word-break:break-all;", DEFAULT_LORA_DIR);
      const list = el("div", "display:flex;flex-direction:column;gap:8px;");
      const refreshBtn = btn("🔄 Обновить список из папки");
      root.append(folderLabel, list, refreshBtn);
      stopKeysBubbling(root);

      const fit = () => {
        // LiteGraph охотно растит ноду под новый размер, но не даёт ей уменьшиться (держит
        // прежний максимум) — сброс высоты перед setSize заставляет пересчитать заново, поэтому
        // сворачивание карточки (например, гаечкой) реально уменьшает окно, а не только разворачивание.
        node.size[1] = 0;
        node.setSize([node.size[0], Math.max(root.scrollHeight + 70, 160)]);
        app.graph.setDirtyCanvas(true, true);
      };
      const save = () => {
        // lorasW — то, что реально уйдёт в Python при запуске (какие LoRA включены/с какой силой);
        // summaryW — просто текст для справки на выходе ноды.
        lorasW.value = JSON.stringify(loraStore.list());
        summaryW.value = summarize(loraStore.list());
      };
      const render = () => {
        list.innerHTML = "";
        const items = loraStore.list();
        const firstDisabledIdx = items.findIndex((l) => !l.enabled);
        items.forEach((l, i) => {
          const c = renderCard(l, i, items);
          // Граница включённые/выключенные — увеличенный отступ (втрое больше обычного gap:8px).
          if (i === firstDisabledIdx && i > 0) c.style.marginTop = "16px";
          list.append(c);
        });
        save();
        fit();
      };

      // card() из lib/dom.js ждёт (title, arr, i, ctx, body, opts) — arr/i только для хранения
      // l._collapsed и для стандартного кластера ↑↓✕, которого тут нет (список ведёт папка на диске,
      // не ручной ввод — «выкл» и есть «убрать»): opts.rightControl подменяет его на вкл/выкл-пилюлю.
      // ctx карточке нужен только для ctx.fit() при сворачивании — своего Menu/state тут нет.
      function renderCard(l, i, items) {
        const body = [];
        body.push(el("div", "font-size:11px;font-family:monospace;opacity:.6;word-break:break-all;", fullPath(l.file || "")));

        // Метки режима (Ref2V/I2V/T2V и т.п.) — какие режимы подходят этой LoRA. Список свой,
        // пользователь заводит его сам под конкретную LoRA (нет фиксированного набора).
        const tagsRow = el("div", "display:flex;flex-wrap:wrap;gap:5px;align-items:center;");
        const paintTags = () => {
          tagsRow.innerHTML = "";
          (l.tags || []).forEach((tag) => {
            const c = tagColor(tag);
            const pill = el(
              "span",
              `display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 5px 3px 10px;` +
              `font-size:11px;background:${c}26;border:1px solid ${c}66;color:${c};`,
              tag
            );
            const x = el("span", "cursor:pointer;opacity:.75;font-size:10px;padding:0 3px;", "✕");
            x.onclick = async (e) => {
              e.stopPropagation();
              l.tags = (l.tags || []).filter((t) => t !== tag);
              await loraStore.update(l.id, { tags: l.tags });
              paintTags();
            };
            pill.append(x);
            tagsRow.append(pill);
          });
          const addTag = el(
            "span",
            `cursor:pointer;border-radius:999px;padding:3px 9px;font-size:11px;color:${THEME.text.muted};` +
            `background:${THEME.surface.smallBtn};border:1px dashed ${THEME.border.dashed};`,
            "+ режим"
          );
          addTag.onclick = (e) => {
            e.stopPropagation();
            const input = el("input", `width:90px;font-size:11px;padding:2px 6px;${INPUT_CSS}`);
            input.placeholder = "Ref2V";
            tagsRow.replaceChild(input, addTag);
            input.focus();
            const commit = async () => {
              const v = input.value.trim();
              if (v && !(l.tags || []).includes(v)) {
                l.tags = [...(l.tags || []), v];
                await loraStore.update(l.id, { tags: l.tags });
              }
              paintTags();
            };
            input.addEventListener("keydown", (e2) => { e2.stopPropagation(); if (e2.key === "Enter") input.blur(); });
            input.addEventListener("blur", commit);
          };
          tagsRow.append(addTag);
        };
        paintTags();
        body.push(tagsRow);

        // Триггер-слова — отдельное структурное поле (не то же самое, что произвольный «Гайд» ниже):
        // именно из него promptBlocks.js берёт текст, который автоматически подставляется в промпт
        // PromptBlocks, пока эта LoRA включена (см. core/compile.js — вставляется после референсов,
        // перед первым шотом), и убирается сам, когда LoRA выключена.
        const triggerInput = el("input", `width:100%;${INPUT_CSS}`);
        triggerInput.value = l.trigger || "";
        triggerInput.placeholder = "Триггер-слова (автоматически уйдут в промпт, пока LoRA включена)";
        triggerInput.addEventListener("input", async () => { await loraStore.update(l.id, { trigger: triggerInput.value }); save(); });
        body.push(row(el("span", "min-width:80px;", "Триггер:"), triggerInput));

        const strengthRow = el("div", "display:flex;align-items:center;gap:8px;");
        const strengthLabel = el("span", "font-size:12px;opacity:.8;", "Сила:");
        const strengthSlider = el("input", "flex:1;");
        strengthSlider.type = "range"; strengthSlider.min = "0"; strengthSlider.max = "2"; strengthSlider.step = "0.05";
        strengthSlider.value = l.strength ?? l.defaultStrength ?? DEFAULT_STRENGTH;
        const strengthVal = el("span", "font-size:12px;min-width:32px;", fmtStrength(strengthSlider.value));
        const defaultInput = el("input", `width:50px;font-size:11px;${INPUT_CSS}`);
        defaultInput.value = fmtStrength(l.defaultStrength ?? DEFAULT_STRENGTH);
        defaultInput.title = "Дефолтное значение силы (заметка, не применяется само)";
        strengthSlider.addEventListener("input", async () => {
          strengthVal.textContent = fmtStrength(strengthSlider.value);
          await loraStore.update(l.id, { strength: Number(strengthSlider.value) });
          save();
        });
        defaultInput.addEventListener("input", async () => { await loraStore.update(l.id, { defaultStrength: Number(defaultInput.value) || 0 }); });
        strengthRow.append(strengthLabel, strengthSlider, strengthVal, el("span", "font-size:10px;opacity:.5;", "дефолт:"), defaultInput);
        body.push(strengthRow);

        // Гайд — не textarea, открытая всегда, а компактная строка: пусто -> просто маленькая
        // кнопка «+ описание»; есть текст -> одна строка с многоточием + значок инфо (наведение —
        // полный текст тултипом) + карандаш (открывает textarea на редактирование, до потери фокуса).
        let guideNode;
        if (l._editGuide) {
          const area = el("textarea", `width:100%;resize:vertical;font-size:12px;${INPUT_CSS}`);
          area.rows = 3;
          area.value = l.guide || "";
          area.placeholder = "Гайд: рекомендуемый сэмплер/шаги, важные заметки";
          area.addEventListener("input", async () => { await loraStore.update(l.id, { guide: area.value }); save(); });
          area.addEventListener("blur", () => { l._editGuide = false; render(); });
          guideNode = area;
        } else if ((l.guide || "").trim()) {
          const text = el(
            "span",
            `flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:${THEME.text.pillOff};`,
            l.guide.trim()
          );
          const info = icon("info", { size: 14, color: THEME.text.summary });
          info.style.cursor = "help";
          info.title = l.guide.trim();
          const editBtn = icon("pencil", { size: 13, color: THEME.text.summary });
          editBtn.style.cssText += "cursor:pointer;";
          editBtn.onclick = (e) => { e.stopPropagation(); l._editGuide = true; render(); };
          guideNode = el("div", "display:flex;align-items:center;gap:7px;");
          guideNode.append(text, info, editBtn);
        } else {
          const addGuide = el(
            "span",
            `cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-size:11px;color:${THEME.text.faint};`,
          );
          addGuide.append(icon("pencil", { size: 12, color: THEME.text.faint }), el("span", "", "Добавить описание"));
          addGuide.onclick = (e) => { e.stopPropagation(); l._editGuide = true; render(); };
          guideNode = addGuide;
        }
        body.push(guideNode);

        const toggle = el(
          "button",
          "cursor:pointer;border-radius:999px;border:1px solid transparent;white-space:nowrap;" +
          `padding:4px 11px;font-size:11px;font-weight:600;background:${l.enabled ? THEME.status.onBg : THEME.status.offBg};` +
          `color:${l.enabled ? THEME.status.onText : THEME.status.offText};`,
          l.enabled ? "Вкл" : "Выкл"
        );
        toggle.onclick = async (e) => {
          e.stopPropagation();
          l.enabled = !l.enabled;
          await loraStore.update(l.id, { enabled: l.enabled });
          // Включение — сразу наверх (в группу включённых), выключение — сразу вниз
          // (в группу выключенных). Порядок внутри каждой группы не трогаем.
          await (l.enabled ? loraStore.moveToFront(l.id) : loraStore.moveToBack(l.id));
          render();
        };

        // Гаечка сочно-зелёная, когда LoRA включена, и серая — когда выключена: цвет самой
        // иконки говорит о состоянии, а не о категории (для этого есть отдельная полоска слева).
        return card(l.name || l.file || "LoRA", items, i, { fit }, body, {
          color: CARD_COLORS.lora, icon: "wrench", iconColor: l.enabled ? THEME.status.onIcon : THEME.status.offIcon,
          rightControl: toggle, boldTitle: false,
          summary: `сила ${fmtStrength(l.strength ?? l.defaultStrength ?? DEFAULT_STRENGTH)}`,
        });
      }

      refreshBtn.onclick = async () => {
        refreshBtn.textContent = "Сканирую…";
        await syncFromFolder();
        render();
        refreshBtn.textContent = "🔄 Обновить список из папки";
      };

      node.addDOMWidget("editor", "lora_guide_ui", root, { serialize: false, getMinHeight: () => 60 });
      lorasW.value = "[]";
      summaryW.value = "";
      node.setSize([420, 200]);
      new ResizeObserver(() => fit()).observe(list);
      loraStore.load().then(async () => { await syncFromFolder(); render(); });
    };
  },
});
