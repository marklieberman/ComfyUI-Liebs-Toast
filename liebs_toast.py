import time
import os;
from aiohttp import web
from server import PromptServer
from comfy.model_management import throw_exception_if_processing_interrupted

if os.name == 'nt':
    from .backend_windows import toast
else:
    from .backend_unsupported import toast

mailbox = {}

"""
Handler to receive messages from the frontend.
"""
@PromptServer.instance.routes.post('/liebs-toast-message')
async def liebs_toast_message(request):
    post = await request.post()
    toast_tab_id = post.get("toast_tab_id")    
    mailbox[toast_tab_id] = { "page_visibility": post.get("page_visibility") }
    return web.json_response({})

"""
Send a message to the frontend.
"""
def send_request(topic, data):
    PromptServer.instance.send_sync(topic, data)

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
        
        # Prepare a slot to receive a message.
        mailbox[toast_tab_id] = None

        # Ask the frontend about the page visibility.
        req = { "toast_tab_id": toast_tab_id }
        send_request("liebs-toast-visible", req)

        # Wait for a response from the frontend.
        while mailbox[toast_tab_id] is None:
            throw_exception_if_processing_interrupted()
            time.sleep(0.2)

        res = mailbox[toast_tab_id]
        del mailbox[toast_tab_id]

        # Send a toast if the page is not visibile.
        if res["page_visibility"] != 'visible':
            toast(title, body, silent, duration, addon_present, callback=on_activated)

        return ()
