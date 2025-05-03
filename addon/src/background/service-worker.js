// Load the list of ComfyUI domains from settings.
chrome.storage.local.get({
    comfyDomains: []
}).then(async config => {
    // Reset the ComfyUI domains if it somehow became empty.
    let comfyDomains = config.comfyDomains;
    if (comfyDomains?.length === 0) {
        console.log('Resetting comfy domains');
        comfyDomains = [
            'http://localhost/*',
            'http://127.0.0.1/*'
        ];
        await chrome.storage.local.set({
            comfyDomains
        });
    }    

    try {
        // Register the content script.
        const scripts = [{
            id: 'activator',
            js: [ '/content/activator.js' ],
            matches: comfyDomains,
            runAt: 'document_start',
            persistAcrossSessions: true
        }];
        await chrome.scripting.registerContentScripts(scripts);
        console.log('registered content scripts', scripts);
    } catch (ex) {
        console.error('failed to register content script', ex);
    }
});

// Listen for messages from the ComfyUI extension.
chrome.runtime.onMessage.addListener(async (request, sender) => {
    const topic = request?.topic,
        detail = request?.detail;
    if (topic === 'liebs-toast-click') {
        if (detail?.action === 'show-tab') {
            // Activate the sender tab and window to show the workflow.
            let tab = await chrome.tabs.update(sender.tab.id, {
                active: true
            });        
            await chrome.windows.update(tab.windowId, {
                focused: true
            });
        }
    }    
});