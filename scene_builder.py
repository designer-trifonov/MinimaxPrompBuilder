class SceneBuilder:
    """Сборщик описания сцены: объекты (человек, животное) → один английский текст.

    Вся логика сборки живёт в JS (js/scene/*), как и в PromptBlocks: интерфейс собирает готовый
    текст и кладёт его в скрытое поле `prompt`.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "blocks": ("STRING", {"default": "[]", "multiline": False, "hidden": True}),
                "prompt": ("STRING", {"default": "", "multiline": False, "hidden": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "run"
    CATEGORY = "MiniMax H3"

    def run(self, blocks, prompt):
        return (prompt,)
