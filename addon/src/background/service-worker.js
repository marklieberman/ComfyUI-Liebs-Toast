// Load the list of ComfyUI domains from settings.
chrome.storage.local.get({
    comfyDomains: [
        'http://localhost:8188/*',
        'http://127.0.0.1:8188/*'
    ]
}).then(config => {
    // Register the content scripts that forwards messages from the ComfyUI extension.
    const scripts = [{
        id: 'activator',
        js: [ 'content/activator.js' ],
        matches: config.comfyDomains,
        runAt: 'document_start',
        persistAcrossSessions: true
    }];
    console.log(scripts);   
    chrome.scripting.registerContentScripts(scripts)
        .then(() => console.log('registered content scripts', scripts))
        .catch(ex => console.error('failed to register content script', ex));
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