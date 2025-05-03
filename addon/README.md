# ComfyUI-Liebs-Toast Add-on

Listens for postMessages from the ComfyUI tabs and activates the tab when requested.

## Installation

Install the add-on from your browser's add-on store.

* Chrome: not available yet.
* Edge: not available yet.
* Firefox: not available yet.

### Permissions

By default the add-on will only request permission to run on `http://127.0.0.1/*` and `http://localhost/*`. You must request additional permissions in the add-on's options to run the add-on on other domains.

## Building

```sh
# Watch files for changes and run lint and sass tasks.
gulp watch

# Lint the JavaScript code.
gulp lint

# Compile the CSS files from the SASS source.
gulp sass

# Zip the extension to dist/comfyui-liebs-toast.zip
gulp dist
```