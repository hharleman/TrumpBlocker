// Trump Blocker Chrome Extension Popup Functionality
const API_BASE_URL = 'https://trumpblocker.com/api';

const DEFAULT_SETTINGS = {
    categories: {
        trump: false, // Free tier - start OFF
        vance: false,
        rightwing: false,
        redpill: false,
        foxnews: false,
        redpillcontent: false,
        custom: false
    },
    customKeywords: '',
    isPremium: false,
    userId: null,
    pinEnabled: false,
    pinCode: '',
    isAuthenticated: false
};

// State management
let currentSettings = { ...DEFAULT_SETTINGS };
let isPremiumUser = false;
let userPin = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
    await checkAuthenticationStatus();
});

// Load settings from storage
async function loadSettings() {
    try {
        const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
        currentSettings = { ...DEFAULT_SETTINGS, ...stored };
        updateUI();
    } catch (error) {
        updateUI();
    }
}

// Update UI based on current state
function updateUI() {
    updateToggleStates();
    updatePremiumStatus();
    updatePinSection();
}

// Update toggle switch states
function updateToggleStates() {
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        const category = toggle.dataset.category;
        const isActive = currentSettings.categories[category] || false;
        
        if (isActive) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }

        // Only Trump toggle is available for free users
        if (!isPremiumUser && category !== 'trump') {
            toggle.classList.add('locked');
            toggle.style.pointerEvents = 'none';
        } else {
            toggle.classList.remove('locked');
            toggle.style.pointerEvents = 'auto';
        }
    });
}

// Update premium status and UI
function updatePremiumStatus() {
    const premiumUpgrade = document.querySelector('.premium-upgrade-inline');
    
    if (isPremiumUser) {
        if (premiumUpgrade) premiumUpgrade.style.display = 'none';
    } else {
        if (premiumUpgrade) premiumUpgrade.style.display = 'block';
    }
}

// Update PIN section
function updatePinSection() {
    const pinToggle = document.getElementById('pinToggle');
    const pinInput = document.getElementById('pinInput');
    
    if (currentSettings.pinEnabled) {
        pinToggle.classList.add('active');
    } else {
        pinToggle.classList.remove('active');
    }
    
    // PIN section is only available for premium users
    const pinSection = document.querySelector('.pin-section');
    if (!isPremiumUser) {
        pinSection.style.opacity = '0.5';
        pinSection.style.pointerEvents = 'none';
    } else {
        pinSection.style.opacity = '1';
        pinSection.style.pointerEvents = 'auto';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Toggle switches for content categories
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        const category = toggle.dataset.category;
        
        toggle.addEventListener('click', async (e) => {
            // Prevent action on locked toggles
            if (toggle.classList.contains('locked') && !isPremiumUser) {
                showUpgradePrompt();
                return;
            }

            // Check PIN protection
            if (currentSettings.pinEnabled && !await verifyPin()) {
                return;
            }

            await toggleCategory(category);
        });
    });

    // PIN toggle
    const pinToggle = document.getElementById('pinToggle');
    pinToggle.addEventListener('click', async () => {
        if (!isPremiumUser) {
            showUpgradePrompt();
            return;
        }
        await togglePinProtection();
    });

    // No PIN submit button needed anymore

    // Premium upgrade link
    const premiumLink = document.querySelector('.premium-link');
    if (premiumLink) {
        premiumLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://trumpblocker.com/dashboard' });
        });
    }

    setupLoginButton();
}

// Setup login button
function setupLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://trumpblocker.com/sign-up' });
        });
    }
}

// Setup dashboard button
function setupDashboardButton() {
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://trumpblocker.com/dashboard' });
        });
    }
}

// Toggle category on/off
async function toggleCategory(category) {
    const newState = !currentSettings.categories[category];
    currentSettings.categories[category] = newState;
    
    await saveSettings();
    updateToggleStates();
}

// Toggle PIN protection
async function togglePinProtection() {
    if (!currentSettings.pinEnabled) {
        // Enabling PIN - ask user to set one
        alert('To enable PIN protection, please set your 6-digit PIN in the dashboard. Once set, return here to enable protection.');
        // Open dashboard
        chrome.tabs.create({ url: 'https://trumpblocker.com/dashboard' });
        return;
    } else {
        // Disabling PIN - require current PIN verification
        if (!await verifyPin()) {
            // Reset the toggle if PIN verification failed
            updatePinSection();
            return;
        }
        
        currentSettings.pinEnabled = false;
        currentSettings.pinCode = '';
    }
    
    await saveSettings();
    updatePinSection();
}

// Handle PIN submission - removed since we no longer have PIN input field

// Verify PIN for protected actions
async function verifyPin() {
    if (!currentSettings.pinEnabled) {
        return true;
    }
    
    const pin = prompt('Enter your PIN to continue:');
    if (!pin) {
        return false;
    }
    
    if (pin === currentSettings.pinCode) {
        return true;
    } else {
        alert('Incorrect PIN.');
        return false;
    }
}

// Show upgrade prompt for locked features
function showUpgradePrompt() {
    alert('This feature is available in the premium version. Click "Upgrade to Premium" to unlock all features.');
}

// Check authentication status with the website
async function checkAuthenticationStatus() {
    try {
        // This would normally check with your website's API
        // For now, we'll simulate the check
        const response = await fetch(`${API_BASE_URL}/user/premium-status`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            isPremiumUser = data.isPremium;
            currentSettings.isPremium = isPremiumUser;
            currentSettings.userId = data.userId;
            
            if (isPremiumUser) {
                // Load user's PIN settings from server
                await syncUserSettings();
            }
            
            updateUI();
        }
    } catch (error) {
        // If we can't reach the server, keep current state
    }
}

// Sync settings with user's account
async function syncUserSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/extension-settings`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const serverSettings = await response.json();
            // Merge server settings with local settings
            currentSettings = { ...currentSettings, ...serverSettings };
            await saveSettings();
        }
    } catch (error) {
    }
}

// Save settings to Chrome storage and notify content scripts
async function saveSettings() {
    try {
        await chrome.storage.sync.set(currentSettings);
        
        // Notify all tabs to update their content blocking
        const tabs = await chrome.tabs.query({});
        const updateMessage = {
            type: 'SETTINGS_UPDATED',
            settings: currentSettings
        };
        
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, updateMessage);
            } catch (e) {
                // Tab might not have content script, ignore
            }
        }
        
        // Also send to background script
        chrome.runtime.sendMessage(updateMessage);
    } catch (error) {
    }
}

// Listen for messages from background script or website
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'USER_AUTHENTICATED') {
        isPremiumUser = message.isPremium;
        currentSettings.isPremium = isPremiumUser;
        currentSettings.userId = message.userId;
        updateUI();
        if (isPremiumUser) {
            syncUserSettings();
        }
    } else if (message.type === 'PREMIUM_STATUS_CHANGED') {
        isPremiumUser = message.isPremium;
        currentSettings.isPremium = isPremiumUser;
        updateUI();
    }
});

// Handle website link click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('website-link')) {
        e.preventDefault();
        chrome.tabs.create({ url: e.target.href });
    }
});