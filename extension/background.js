// Background script for Trump Blocker extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Trump Blocker extension installed');
    
    // Set default settings
    const defaultSettings = {
        categories: {
            trump: true,
            vance: true,
            rightwing: true,
            redpill: true,
            foxnews: true,
            redpillcontent: true
        },
        customKeywords: '',
        isPremium: false,
        requireAuth: false
    };
    
    chrome.storage.sync.set(defaultSettings);
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup (default behavior)
    // Additional actions can be added here if needed
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_SETTINGS') {
        chrome.storage.sync.get(null, (settings) => {
            sendResponse(settings);
        });
        return true; // Keep the message channel open for async response
    }
    
    if (request.type === 'UPDATE_BADGE') {
        chrome.action.setBadgeText({
            text: request.count > 0 ? request.count.toString() : '',
            tabId: sender.tab.id
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#ff6b6b',
            tabId: sender.tab.id
        });
    }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        // Notify all content scripts about settings changes
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    settings: changes
                }).catch(() => {
                    // Ignore errors for tabs without content scripts
                });
            });
        });
    }
});

// Context menu (optional feature)
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'toggleBlocking') {
        chrome.storage.sync.get(['enabled'], (result) => {
            const newState = !result.enabled;
            chrome.storage.sync.set({ enabled: newState });
            
            chrome.tabs.sendMessage(tab.id, {
                type: 'TOGGLE_BLOCKING',
                enabled: newState
            });
        });
    }
});

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'toggleBlocking',
        title: 'Toggle Trump Blocker',
        contexts: ['page']
    });
});