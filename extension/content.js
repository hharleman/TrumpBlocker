// Content script for blocking political content
(function() {
    'use strict';

    const KEYWORD_LISTS = {
        trump: [
            'donald trump', 'trump', 'potus', 'president trump', 'maga', 
            'make america great again', 'truth social', 'mar-a-lago'
        ],
        vance: [
            'jd vance', 'j.d. vance', 'vance', 'vice president vance'
        ],
        rightwing: [
            'charlie kirk', 'ben shapiro', 'candice owens', 'tucker carlson', 'sean hannity',  
            'laura ingraham', 'jesse watters'
        ],
        redpill: [
            'fresh & fit', 'fresh and fit', 'andrew tate', 'tristan tate', 'pearl davis', 
            'justpearlythings', 'kevin samuels'
        ],
        foxnews: [
            'fox news', 'foxnews'
        ],
        redpillcontent: [
            'awalt', 'all women are like that', 'alpha male', 'beta male', 'smv', 'sex market value', 
            'conservative', 'republican', 'gop', 'right wing', 'rightwing', 'tea party', 'proud boys', 
            'qanon', 'alt-right', 'manosphere', 'mgtow', 'incel', 'alpha male', 'beta male', 'sigma male', 
            'cultural marxism', 'woke agenda'
        ]
    };

    let settings = {
        categories: {
            trump: true,
            vance: true,
            rightwing: true,
            redpill: true,
            foxnews: true,
            redpillcontent: true
        },
        customKeywords: ''
    };

    let blockedCount = 0;

    async function loadSettings() {
        try {
            const stored = await chrome.storage.sync.get(settings);
            settings = { ...settings, ...stored };
        } catch (error) {
            console.log('Trump Blocker: Could not load settings:', error);
        }
    }

    function getActiveKeywords() {
        let keywords = [];
        
        Object.keys(settings.categories).forEach(category => {
            if (settings.categories[category] && KEYWORD_LISTS[category]) {
                keywords.push(...KEYWORD_LISTS[category]);
            }
        });

        if (settings.customKeywords) {
            const customKeywords = settings.customKeywords
                .split(',')
                .map(k => k.trim().toLowerCase())
                .filter(k => k.length > 0);
            keywords.push(...customKeywords);
        }

        return [...new Set(keywords)];
    }

    function containsBlockedContent(text) {
        if (!text) return false;
        
        const lowerText = text.toLowerCase();
        const keywords = getActiveKeywords();
        
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }

    function createBlockedPlaceholder(originalElement) {
        const placeholder = document.createElement('div');
        placeholder.className = 'trump-blocker-placeholder';
        placeholder.style.cssText = `
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 10px 0;
            font-family: Arial, sans-serif;
            position: relative;
            border: 2px solid #ff5252;
        `;
        
        placeholder.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">🚫</div>
            <div style="font-weight: bold; margin-bottom: 5px;">Content Blocked</div>
            <div style="font-size: 12px; opacity: 0.8;">Blocked by Trump Blocker extension</div>
            <button class="trump-blocker-show-btn" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
                font-size: 12px;
            ">Show Content</button>
        `;

        const showBtn = placeholder.querySelector('.trump-blocker-show-btn');
        showBtn.addEventListener('click', () => {
            placeholder.style.display = 'none';
            originalElement.style.display = '';
            blockedCount--;
        });

        return placeholder;
    }

    function hideElement(element) {
        if (element.classList.contains('trump-blocker-hidden')) return;
        
        element.classList.add('trump-blocker-hidden');
        element.style.display = 'none';
        
        const placeholder = createBlockedPlaceholder(element);
        element.parentNode.insertBefore(placeholder, element);
        
        blockedCount++;
    }

    function scanForBlockedContent() {
        const textElements = document.querySelectorAll(`
            p, h1, h2, h3, h4, h5, h6, span, div, a, li, 
            article, section, [data-testid], [class*="post"], 
            [class*="tweet"], [class*="story"], [class*="article"]
        `);

        textElements.forEach(element => {
            if (element.classList.contains('trump-blocker-placeholder') || 
                element.classList.contains('trump-blocker-hidden')) {
                return;
            }

            const text = element.textContent || '';
            const title = element.title || '';
            const alt = element.alt || '';
            const href = element.href || '';
            
            const allText = `${text} ${title} ${alt} ${href}`;
            
            if (containsBlockedContent(allText)) {
                // For social media posts, hide the entire post container
                let containerToHide = element;
                
                // Try to find the post container
                const postSelectors = [
                    '[data-testid*="tweet"]',
                    '[class*="post"]',
                    '[class*="story"]',
                    'article',
                    '[role="article"]'
                ];
                
                for (const selector of postSelectors) {
                    const container = element.closest(selector);
                    if (container) {
                        containerToHide = container;
                        break;
                    }
                }
                
                hideElement(containerToHide);
            }
        });

        // Special handling for images with alt text
        const images = document.querySelectorAll('img[alt]');
        images.forEach(img => {
            if (containsBlockedContent(img.alt)) {
                hideElement(img.closest('figure') || img.parentElement || img);
            }
        });

        // Special handling for video titles
        const videos = document.querySelectorAll('video, [class*="video"]');
        videos.forEach(video => {
            const title = video.title || video.getAttribute('aria-label') || '';
            if (containsBlockedContent(title)) {
                hideElement(video.closest('[class*="video"]') || video.parentElement || video);
            }
        });
    }

    function updateBadge() {
        if (typeof chrome !== 'undefined' && chrome.action) {
            chrome.action.setBadgeText({
                text: blockedCount > 0 ? blockedCount.toString() : ''
            });
            chrome.action.setBadgeBackgroundColor({color: '#ff6b6b'});
        }
    }

    // Listen for settings updates
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SETTINGS_UPDATED') {
            settings = message.settings;
            
            // Re-scan the page with new settings
            document.querySelectorAll('.trump-blocker-placeholder').forEach(el => el.remove());
            document.querySelectorAll('.trump-blocker-hidden').forEach(el => {
                el.classList.remove('trump-blocker-hidden');
                el.style.display = '';
            });
            
            blockedCount = 0;
            scanForBlockedContent();
            updateBadge();
        }
    });

    // Initialize
    loadSettings().then(() => {
        // Initial scan
        scanForBlockedContent();
        updateBadge();

        // Set up mutation observer for dynamic content
        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain text
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                            shouldScan = true;
                            break;
                        }
                    }
                }
            });
            
            if (shouldScan) {
                setTimeout(() => {
                    scanForBlockedContent();
                    updateBadge();
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Periodic re-scan for sites with complex dynamic loading
        setInterval(() => {
            scanForBlockedContent();
            updateBadge();
        }, 3000);
    });

})();