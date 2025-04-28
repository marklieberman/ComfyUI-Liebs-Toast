import os;
from server import PromptServer

if os.name == 'nt':
    from .backend_windows import toast
else:
    from .backend_unsupported import toast

class LiebsToast:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "image_trigger": ("IMAGE",),
            },
            "optional": {
                "title": ("STRING", {"default": "ComfyUI Workflow"}),
                "body": ("STRING", {"multiline": True, "default": "Attention requested"}),
                "duration": (["long", "short"], {}),
                "silent": ("BOOLEAN", {"default": True}),                
            },
            "hidden": {
                "toast_tab_id": ("STRING",),
                "addon_present": ("BOOLEAN",),
                "unique_id": "UNIQUE_ID",
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "func"
    CATEGORY = "notify"
    OUTPUT_NODE = True

    def func(self, image_trigger, title, body, silent, duration, toast_tab_id, addon_present, unique_id):
        # Forward the toast activation to the frontend.
        def on_activated(result):
            PromptServer.instance.send_sync("liebs-toast-click", { "toast_tab_id": toast_tab_id, "action": result["button"] })

        toast(title, body, silent, duration, addon_present, callback=on_activated)
        return ()
