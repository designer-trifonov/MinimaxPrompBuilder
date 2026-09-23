import json

from nodes import LoraLoaderModelOnly


class LoraGuide:
    """LoRA Guide: заменяет цепочку из нескольких LoraLoaderModelOnly одной нодой.
    Принимает MODEL (например, из UNETLoader), применяет по очереди все LoRA, у которых
    в интерфейсе включён тумблер «вкл» (сила и список берутся из user/default/PromptBlocks/loras.json,
    редактируется в JS), отдаёт готовый MODEL дальше по графу — сравни с 145→151→164 в
    Minimax_h3_References.json, тут это всё внутри одной ноды."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model": ("MODEL",),
                "loras": ("STRING", {"default": "[]", "multiline": False, "hidden": True}),
                "summary": ("STRING", {"default": "", "multiline": False, "hidden": True}),
            }
        }

    RETURN_TYPES = ("MODEL", "STRING")
    RETURN_NAMES = ("model", "summary")
    FUNCTION = "run"
    CATEGORY = "MiniMax H3"

    def run(self, model, loras, summary):
        try:
            items = json.loads(loras)
        except Exception:
            items = []

        loader = LoraLoaderModelOnly()
        out_model = model
        for l in items:
            if not l.get("enabled"):
                continue
            file = l.get("file")
            strength = float(l.get("strength", 1) or 0)
            if not file or strength == 0:
                continue
            (out_model,) = loader.load_lora_model_only(out_model, file, strength)

        return (out_model, summary)
