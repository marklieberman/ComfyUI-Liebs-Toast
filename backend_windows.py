from windows_toasts import AudioSource, InteractableWindowsToaster, Toast, ToastDuration, ToastAudio, ToastButton,ToastActivatedEventArgs

interactable_toaster = InteractableWindowsToaster('ComfyUI')

def on_activated(toast, callback):
    """
    Return a toast activation handler function that invokes the callback.
    """
    def handler(activatedEventArgs: ToastActivatedEventArgs):
        interactable_toaster.remove_toast(toast)
        callback({ "button": activatedEventArgs.arguments })

    return handler

def on_dismissed(toast):
    """
    Remove a toast when dismissed or timed out.
    """
    def handler(_):
        interactable_toaster.remove_toast(toast)

    return handler

def toast(title, body, silent, duration, addon_present, callback):
    """
    Display a toast notification on Windows.
    """
    new_toast = Toast()
    new_toast.text_fields = [ title, body ]

    if addon_present:
        new_toast.AddAction(ToastButton('View Workflow', 'show-tab'))

    if silent:
        new_toast.audio = ToastAudio(AudioSource.Default, silent=True)

    new_toast.duration = ToastDuration.Long if duration == 'long' else ToastDuration.Short

    new_toast.on_activated = on_activated(new_toast, callback)
    new_toast.on_dismissed = on_dismissed(new_toast)
    interactable_toaster.show_toast(new_toast)
