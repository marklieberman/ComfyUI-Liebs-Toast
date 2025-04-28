from .liebs_toast import LiebsToast

NODE_CLASS_MAPPINGS = {
    "LiebsToast": LiebsToast,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LiebsToast": "Toast",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]