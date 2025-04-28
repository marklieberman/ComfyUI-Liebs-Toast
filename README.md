# ComfyUI-Liebs-Toast

A node to display a toast notification. Use it to send a toast when your prompt is complete. Also pairs well with [ComfyUI-Liebs_Picker](https://github.com/marklieberman/ComfyUI-Liebs-Picker) and [cg-image-filter](https://github.com/chrisgoringe/cg-image-filter) to be notified when the picker is waiting.

## Features

* Display a toast notification.

* Customize the toast message, duration, and/or silence the notification audio.

* **[Browser add-on required]** "View Workflow" button in the toast will bring focus to the browser tab that sent the toast.

## Browser Add-on

The browser add-on provides additional functionality that is not otherwise available. Specifically, it allows the Python node to activate the browser tab when you click the "View Workflow" button in the toast.

* Chrome addon: not available yet.
* Edge addon: not available yet.
* Firefox addon: not available yet.

### Permissions

By default the add-on will only request permission to run on `http://localhost:8188/*`. You must request additional permissions in the add-on's options to run the addon on other domains or ports.

## Limitations

* Currently only Windows is supported. Help to implement support for additional platforms would be appreciated.
