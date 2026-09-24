FPS = 24  # модель MiniMax H3 работает на 24 кадрах в секунду


def frames_for(seconds):
    """Секунды → число кадров для входа `length` ноды MiniMax H3 (та же формула, что у старой
    PromptBlocks в __init__.py — продублирована здесь, чтобы не городить циклический импорт)."""
    n = max(5, round(float(seconds) * FPS))
    while n % 17 != 5:
        n += 1
    return n


class PromptBlocksV2:
    """Новая система (js/system/) — параллельно старой PromptBlocks, старую не трогаем."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "duration": ("FLOAT", {"default": 5.0, "min": 1.0, "max": 15.0, "step": 0.5}),
                "prompt": ("STRING", {"default": "", "multiline": False, "hidden": True}),
            }
        }

    RETURN_TYPES = ("STRING", "INT")
    RETURN_NAMES = ("text", "length")
    FUNCTION = "run"
    CATEGORY = "MiniMax H3/Utils"

    def run(self, duration, prompt):
        return (prompt, frames_for(duration))
