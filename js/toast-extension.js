import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// True if additional features provided by at addon are available.
var addonInstalled = false;

/**
 * Generate a unique identifier using current millis and random.
 */
function generateToastTabId() {
    return `${new Date().valueOf()}_${Math.floor(Math.random() * 1000)}`
}

// Generate or restore the toast tab ID.
const TOAST_TAB_ID_KEY  = 'liebsToastTabId';
var toastTabId = sessionStorage.getItem(TOAST_TAB_ID_KEY);
if (toastTabId) {
    console.log('Restored toast tab ID', toastTabId);
} else {
    toastTabId = generateToastTabId();
    sessionStorage.setItem(TOAST_TAB_ID_KEY, toastTabId);
}

// Python node type.
const NODE_TYPE = 'LiebsToast';

// Register the ComfyUI extension.
app.registerExtension({
	name: "LiebsToast",
    settings: [{
        category: ['Liebs Toast', 'Toasts', 'Toast When Page Is Visible' ],
        id: 'LiebsToast.SendToastPageVisible',
        name: 'Send a toast even if the page is visible',
        type: 'boolean',
        defaultValue: false,
        tooltip: 'Uses the Page Visibility API to determine if the page is visible or hidden',
    }],
    setup() {
        // Add a listener for getting page visibility.
        api.addEventListener('liebs-toast-visible', async (event) => { 
            const detail = event.detail,
                extensionSettings = app.extensionManager.setting;

            const body = new FormData();
            body.append('toast_tab_id', detail.toast_tab_id);
            if (extensionSettings.get('LiebsToast.SendToastPageVisible')) {
                // Pretend that the page is always hidden so it always toasts.
                body.append('page_visibility', 'hidden');
            } else {
                body.append('page_visibility', document.visibilityState);
            }

            api.fetchApi('/liebs-toast-message', { 
                method: 'POST', 
                body 
            });
        });

        // Add a listener for toast callback.
        api.addEventListener("liebs-toast-click", async (event) => { 
            const detail = event.detail;

            if (toastTabId !== detail.toast_tab_id) {
                // Not the tab that ran the prompt.
                return;
            }

            // Relay the message to the browser extension.
            window.postMessage({
                topic: 'liebs-toast-click',
                detail
            });
        });
    },
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeType.comfyClass === NODE_TYPE) { 
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {     
                const r = onNodeCreated?.apply(this, arguments);

                // Add a custom widget for the hidden toast_tab_id input.
                // Nothing is displayed in the node.
                this.addCustomWidget({
                    type: 'STRING',
                    name: 'toast_tab_id',
                    computeSize() {
                        return [0,0]
                    },
                    async serializeValue(nodeId, widgetIndex) {
                        return toastTabId;
                    }
                });

                // Add a parameter indicating if the browser extension is detected.
                this.addCustomWidget({
                    type: 'STRING',
                    name: 'addon_present',
                    computeSize() {
                        return [0,0]
                    },
                    async serializeValue(nodeId, widgetIndex) {
                        return addonInstalled;
                    }
                });

                return r;
            }
        }
    }
})

/**
 * We generate a unique ID for each tab running ComfyUI. This unique "toast tab ID" makes the messages from the prompt 
 * server addressable to the tabs. The toast tab ID is stored in sessionStorage so it will persist even when the tab 
 * is refreshed. 
 * 
 * The Duplicate Tab function in browsers will also duplicate the sessionStorage contents. Using a BroadcastChannel, we 
 * can ask other ComfyUI tabs if the toast tab ID we restored is already being used. A new toast tab ID can be 
 * generated if so.
 */

// Setup a channel to communicate with other tabs running ComfyUI.
const broadcastChannel = new BroadcastChannel('liebs-toast');
broadcastChannel.addEventListener('message', (event) => {    
    const message = event.data;    
    switch (message?.topic) {
        // Another tab is asking for our toast tab ID.
        case 'getToastTabId':            
            broadcastChannel.postMessage({
                topic: 'usingToastTabId',
                toastTabId
            });
            break;
        // Another tab is reporting which toast tab ID it is using.
        case 'usingToastTabId':            
            if (message.toastTabId === toastTabId) {
                // Need to generate a new toast tab ID.
                toastTabId = generateToastTabId();
                sessionStorage.setItem(TOAST_TAB_ID_KEY, toastTabId);
                console.log('Generated a new toast tab ID', toastTabId);
            }
    }
});

// Ask all of the other tabs for their toast tab ID.
broadcastChannel.postMessage({
    topic: 'getToastTabId'
});

/**
 * Send a message to the addon content script. If the addon replies, we know it is installed. This enables additional
 * functionality like the "View Workflow" button in the toast.
 */

const detectAddon = (event) => {
    const topic = event.data?.topic;
    if (topic === 'liebs-toast-detect-reply') {
        addonInstalled = true;
        console.log('ComfyUI-Liebs-Toast add-on detected');
    }
};
window.addEventListener('message', detectAddon);
window.postMessage({ topic: 'liebs-toast-detect' });
setTimeout(() => window.removeEventListener('message', detectAddon), 1000);
