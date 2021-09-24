chrome.tabs.onCreated.addListener(function (tab) {
    if (tab.pendingUrl === 'chrome://newtab/') {
	    chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('index.private.html'), highlighted: true, active: true});   
    }
});
