from .scene_builder import SceneBuilder
from .lora_guide import LoraGuide
from .prompt_blocks_v2 import PromptBlocksV2

FPS = 24  # модель MiniMax H3 работает на 24 кадрах в секунду


def frames_for(seconds):
    """Секунды → число кадров для входа `length` ноды MiniMax H3 (сетка 17k+5, округление вверх)."""
    n = max(5, round(float(seconds) * FPS))
    while n % 17 != 5:
        n += 1
    return n


class PromptBlocks:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "duration": ("FLOAT", {"default": 5.0, "min": 1.0, "max": 15.0, "step": 0.5}),
                "blocks": ("STRING", {"default": "[]", "multiline": False, "hidden": True}),
                "prompt": ("STRING", {"default": "", "multiline": False, "hidden": True}),
            }
        }

    RETURN_TYPES = ("STRING", "INT")
    RETURN_NAMES = ("text", "length")
    FUNCTION = "run"
    CATEGORY = "MiniMax H3"

    def run(self, duration, blocks, prompt):
        # Промпт собирается в JS (единый источник правды для кнопки «Копировать» и выхода).
        # length — кадры для входа `length` ноды модели; duration в этой ноде — точка истины.
        return (prompt, frames_for(duration))


NODE_CLASS_MAPPINGS = {
    "PromptBlocks": PromptBlocks, "SceneBuilder": SceneBuilder, "LoraGuide": LoraGuide,
    "PromptBlocksV2": PromptBlocksV2,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBlocks": "Prompt Blocks", "SceneBuilder": "Scene Builder", "LoraGuide": "LoRA Guide",
    "PromptBlocksV2": "Prompt Blocks (New)",
}
WEB_DIRECTORY = "./js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
