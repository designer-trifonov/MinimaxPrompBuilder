from .prompt_blocks_v2 import PromptBlocksV2

NODE_CLASS_MAPPINGS = {
    "PromptBlocksV2": PromptBlocksV2,
}
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptBlocksV2": "Prompt Blocks (New)",
}
WEB_DIRECTORY = "./js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
