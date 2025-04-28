window.addEventListener('message', (event) => {
    const topic = event.data?.topic;
    switch (topic) {
        // Forward messages from ComfyUI extension to the background worker.
        case 'liebs-toast-click':            
            chrome.runtime.sendMessage({
                topic,
                detail: event.data?.detail
            });
            break;
        // Respond that the addon is installed.
        case 'liebs-toast-detect':            
            window.postMessage({
                topic: 'liebs-toast-detect-reply',
                detail: {}
            });
            break;
    }
});
