// popup-standalone.js - Version without API dependencies
// This version works completely offline for public distribution

const DEFAULT_SETTINGS = {
    categories: {
        trump: true,
        vance: true,
        rightwing: true,
        redpill: true,
        foxnews: true,
        redpillcontent: true
    }
};

// Load settings and update UI
async function loadSettings() {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    // Update toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        const category = toggle.dataset.category;
        if (settings.categories[category]) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    });

    return settings;
}

async function saveSettings(newSettings) {
    await chrome.storage.sync.set(newSettings);
    
    // Notify content scripts of changes
    const tabs = await chrome.tabs.query({ active: true });
    if (tabs[0]) {
        try {
            await chrome.tabs.sendMessage(tabs[0].id, { 
                type: 'SETTINGS_UPDATED', 
                settings: newSettings 
            });
        } catch (e) {
            // Tab might not have content script loaded
        }
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    const settings = await loadSettings();

    // Hide premium sections for standalone version
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('premiumSection').style.display = 'none';
    document.getElementById('customKeywordsSection').style.display = 'none';
    
    // Update status to show it's free version
    document.getElementById('statusText').textContent = 'Free Version - No Account Needed';

    // Toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', async () => {
            const category = toggle.dataset.category;
            const isActive = toggle.classList.contains('active');
            
            // Update UI
            if (isActive) {
                toggle.classList.remove('active');
            } else {
                toggle.classList.add('active');
            }
            
            // Update settings
            const newSettings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
            newSettings.categories[category] = !isActive;
            await saveSettings(newSettings);
        });
    });
});