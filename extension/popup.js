// Extension popup functionality with API integration
const API_BASE_URL = 'https://your-website.com/api'; // Replace with your deployed website

const DEFAULT_SETTINGS = {
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
    userId: null,
    requireAuth: false
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

    // Check premium status
    await checkPremiumStatus();

    return settings;
}

async function checkPremiumStatus() {
    try {
        const userToken = await getUserSessionToken();
        
        if (!userToken) {
            updateUIForFreeUser();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/user/premium-status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUIForPremiumStatus(data.isPremium);
        } else {
            updateUIForFreeUser();
        }
    } catch (error) {
        console.log('Could not check premium status:', error);
        updateUIForFreeUser();
    }
}

async function getUserSessionToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.token;
        }
    } catch (error) {
        console.log('No active session');
    }
    return null;
}

function updateUIForFreeUser() {
    const statusSection = document.getElementById('statusSection');
    const statusText = document.getElementById('statusText');
    const premiumSection = document.getElementById('premiumSection');
    const customKeywordsSection = document.getElementById('customKeywordsSection');
    const authSection = document.getElementById('authSection');

    statusSection.className = 'status free';
    statusText.textContent = 'Free Version Active';
    premiumSection.style.display = 'block';
    customKeywordsSection.style.display = 'none';
    authSection.style.display = 'block';
    chrome.storage.sync.set({ isPremium: false, customKeywords: '' });
}

function updateUIForPremiumStatus(isPremium) {
    const statusSection = document.getElementById('statusSection');
    const statusText = document.getElementById('statusText');
    const premiumSection = document.getElementById('premiumSection');
    const customKeywordsSection = document.getElementById('customKeywordsSection');
    const authSection = document.getElementById('authSection');

    if (isPremium) {
        statusSection.className = 'status premium';
        statusText.textContent = '🌟 Premium Active';
        premiumSection.style.display = 'none';
        customKeywordsSection.style.display = 'block';
        authSection.style.display = 'none';

        loadCustomKeywords();
        chrome.storage.sync.set({ isPremium: true });
    } else {
        updateUIForFreeUser();
    }
}

async function loadCustomKeywords() {
    try {
        const userToken = await getUserSessionToken();
        if (!userToken) return;

        const response = await fetch(`${API_BASE_URL}/extension/settings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const settings = await response.json();
            document.getElementById('customKeywords').value = settings.customKeywords || '';
            updateKeywordCount();
        }
    } catch (error) {
        console.log('Could not load custom keywords:', error);
    }
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
            console.log('Could not send message to content script:', e);
        }
    }
}

function updateKeywordCount() {
    const textarea = document.getElementById('customKeywords');
    const countDiv = document.getElementById('keywordCount');
    if (!textarea || !countDiv) return;
    
    const keywords = textarea.value.split(',').filter(k => k.trim().length > 0);
    const count = Math.min(keywords.length, 100);
    countDiv.textContent = `${count}/100 keywords`;

    if (keywords.length > 100) {
        countDiv.style.color = '#ff6b6b';
    } else {
        countDiv.style.color = 'inherit';
    }
}

async function requireAuthForToggle() {
    const settings = await chrome.storage.sync.get(['requireAuth', 'userId']);
    
    if (settings.requireAuth && settings.userId) {
        const confirmed = confirm(
            'This extension is protected by 2FA. ' +
            'In the full version, you would receive an email verification code.'
        );
        return confirmed;
    }
    return true;
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    const settings = await loadSettings();

    // Toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', async () => {
            const canToggle = await requireAuthForToggle();
            if (!canToggle) return;
            
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

    // Sign in button
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: `${API_BASE_URL.replace('/api', '')}/sign-in` });
        });
    }

    // Upgrade button
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: `${API_BASE_URL.replace('/api', '')}/upgrade` });
        });
    }

    // Custom keywords
    const customKeywordsTextarea = document.getElementById('customKeywords');
    if (customKeywordsTextarea) {
        customKeywordsTextarea.addEventListener('input', updateKeywordCount);
        customKeywordsTextarea.addEventListener('blur', async () => {
            const keywords = customKeywordsTextarea.value;
            const keywordList = keywords.split(',').filter(k => k.trim().length > 0);
            
            if (keywordList.length > 100) {
                const limitedKeywords = keywordList.slice(0, 100).join(', ');
                customKeywordsTextarea.value = limitedKeywords;
                updateKeywordCount();
            }
            
            // Save to backend if user is premium
            const userToken = await getUserSessionToken();
            if (userToken) {
                try {
                    await fetch(`${API_BASE_URL}/extension/settings`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            customKeywords: customKeywordsTextarea.value
                        })
                    });
                } catch (error) {
                    console.log('Could not save custom keywords:', error);
                }
            }
            
            const newSettings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
            newSettings.customKeywords = customKeywordsTextarea.value;
            await saveSettings(newSettings);
        });
    }

    // Listen for premium status updates from the website
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'PREMIUM_STATUS_UPDATED') {
            loadSettings();
        }
    });
});