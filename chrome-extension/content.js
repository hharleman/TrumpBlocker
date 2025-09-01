// Content script for blocking political content
(function() {
    'use strict';
    

    const KEYWORD_LISTS = {
        trump: [
            'donald trump', 'trump', 'potus', 'president trump', 'maga', 
            'make america great again', 'truth social', 'mar-a-lago'
        ],
        vance: [
            'jd vance', 'j.d. vance', 'j d vance', 'vice president vance'
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
            'awalt', 'all women are like that', 'redpill', 'red pill', 'smv', 'sex market value', 
            'conservative politics', 'republican party', 'gop politics', 'right wing politics', 'rightwing politics', 'tea party', 'proud boys', 
            'qanon', 'alt-right', 'manosphere', 'mgtow', 'incel movement', 'alpha male mindset', 'beta male theory', 'sigma male', 
            'cultural marxism', 'woke agenda'
        ]
    };

    // Site-specific adapters for better headline detection
    const siteAdapters = {
        'youtube.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'a', 'span', 'p', 'div'
            ],
            findCard: function(element) {
                // Find the closest video container (including Shorts)
                return element.closest([
                    'ytd-video-renderer',
                    'ytd-compact-video-renderer', 
                    'ytd-grid-video-renderer',
                    '#dismissible',
                    'ytd-rich-item-renderer',
                    'ytd-reel-item-renderer',           // YouTube Shorts
                    'ytd-shorts-lockup-view-model',    // YouTube Shorts
                    'ytd-reel-video-renderer',         // YouTube Shorts
                    'div[is-shorts]',                  // YouTube Shorts
                    '.ytd-shorts'                      // YouTube Shorts
                ].join(','));
            },
            processComplete: function() {
                const keywords = getActiveKeywords();
                if (keywords.length === 0) {
                    return;
                }
                
                // STEP 1: Scan ALL YouTube video links and text elements
                document.querySelectorAll('a[href*="/watch"], a[href*="youtu.be"], span.yt-core-attributed-string, h1, h2, h3, h4, h5, h6').forEach((element) => {
                    if (element.classList.contains('trump-blocker-hidden')) return;
                    
                    // Get both text content AND href for comprehensive checking
                    let combinedText = element.textContent || '';
                    if (element.href) {
                        combinedText += ' ' + element.href;
                    }
                    
                    // Check if this contains blocked content
                    if (containsBlockedContent(combinedText)) {
                        // Find the video container and remove it
                        const videoContainer = element.closest([
                            'ytd-video-renderer',
                            'ytd-compact-video-renderer', 
                            'ytd-grid-video-renderer',
                            '#dismissible',
                            'ytd-rich-item-renderer',
                            'ytd-reel-item-renderer',
                            'ytd-shorts-lockup-view-model',
                            'ytd-reel-video-renderer',
                            'div[is-shorts]',
                            '.ytd-shorts'
                        ].join(','));
                        
                        if (videoContainer) {
                            hideElement(videoContainer);
                        } else {
                            // If no container found, hide the element itself
                            hideElement(element);
                        }
                    }
                });

                // STEP 2: Check ALL images for blocked keywords in alt/src
                document.querySelectorAll('img').forEach(img => {
                    if (img.classList.contains('trump-blocker-hidden')) return;
                    
                    const imageText = (img.alt || '') + ' ' + (img.src || '') + ' ' + (img.title || '');
                    if (containsBlockedContent(imageText)) {
                        // Find the video container this image belongs to (including Shorts)
                        const videoContainer = img.closest([
                            'ytd-video-renderer',
                            'ytd-compact-video-renderer', 
                            'ytd-grid-video-renderer',
                            '#dismissible',
                            'ytd-rich-item-renderer',
                            'ytd-reel-item-renderer',           // YouTube Shorts
                            'ytd-shorts-lockup-view-model',    // YouTube Shorts
                            'ytd-reel-video-renderer',         // YouTube Shorts
                            'div[is-shorts]',                  // YouTube Shorts
                            '.ytd-shorts'                      // YouTube Shorts
                        ].join(','));
                        
                        if (videoContainer) {
                            hideElement(videoContainer);
                        } else {
                            hideElement(img);
                        }
                    }
                });
            }
        },
        'news.google.com': {
            headlines: [
                'h3', 'h4', 
                'article h3', 'article h4',
                '[data-n-tid] h3', '[data-n-tid] h4',
                '.JtKENc', '.LC20lb', '.ipQwMb',
                'a[aria-label]'
            ],
            findCard: function(element) {
                let card = element.closest('article');
                if (card) return card;
                
                card = element.closest('[data-n-tid]');
                if (card) return card;
                
                card = element.closest('.SoaBEf, .NiLAwe, .lBwEZb');
                if (card) return card;
                
                return element.closest('div[jsname], div[data-async-type]');
            }
        },
        'news.yahoo.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                '.s-title', '.title', '.headline',
                'a[data-uuid]', 'a[data-id]',
                '.js-content-viewer h3',
                'img' // Also check images directly
            ],
            findCard: function(element) {
                // For Yahoo News, find the li element or data-uuid container
                let card = element.closest('li[data-uuid], [data-uuid]');
                if (card) return card;
                
                card = element.closest('li, .js-stream-content, .story-wrap');
                if (card) return card;
                
                // If it's an image, find its article container
                if (element.tagName === 'IMG') {
                    card = element.closest('li, article, [data-uuid]');
                    if (card) return card;
                }
                
                return element.closest('div');
            },
            processComplete: function() {
                // Strategy 1: Find all Yahoo article containers
                document.querySelectorAll('li[data-uuid], [data-uuid], li, .js-stream-content').forEach(container => {
                    if (container.classList.contains('trump-blocker-hidden')) return;
                    
                    const allText = container.textContent || '';
                    const images = container.querySelectorAll('img');
                    let hasBlockedContent = containsBlockedContent(allText);
                    
                    images.forEach(img => {
                        const imageText = (img.alt || '') + ' ' + (img.src || '') + ' ' + (img.title || '');
                        if (containsBlockedContent(imageText)) {
                            hasBlockedContent = true;
                        }
                    });
                    
                    if (hasBlockedContent) {
                        hideElement(container);
                        return;
                    }
                });

                // Strategy 2: Aggressive image cleanup - find orphaned Trump images
                document.querySelectorAll('img').forEach(img => {
                    if (img.closest('.trump-blocker-hidden')) return;
                    
                    const imageText = (img.alt || '') + ' ' + (img.src || '') + ' ' + (img.title || '');
                    if (containsBlockedContent(imageText)) {
                        
                        // Try to find the closest meaningful container
                        let container = img.closest('li, article, .card, [data-uuid], div[class*="item"], div[class*="story"]');
                        if (!container) {
                            // If no container found, go up parent chain
                            container = img.parentElement;
                            let depth = 0;
                            while (container && depth < 5) {
                                if (container.tagName === 'LI' || 
                                    container.tagName === 'ARTICLE' ||
                                    container.className.match(/item|story|card|content/i)) {
                                    break;
                                }
                                container = container.parentElement;
                                depth++;
                            }
                        }
                        
                        hideElement(container || img);
                    }
                });

                // Strategy 3: Check for links to blocked articles and hide their containers
                document.querySelectorAll('a[href]').forEach(link => {
                    if (link.closest('.trump-blocker-hidden')) return;
                    
                    const linkText = link.textContent + ' ' + link.href + ' ' + (link.title || '');
                    if (containsBlockedContent(linkText)) {
                        const container = link.closest('li, article, .card, div[class*="item"]');
                        if (container) {
                            hideElement(container);
                        }
                    }
                });
            }
        },
        'cnn.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                '.cd__headline', '.cd__headline-text',
                '.container__headline', '.container__title', '.container_headline',
                '.container_headline-text', '.contains_headline-text',
                'a[data-link-type="article"]',
                'p' // Check paragraphs for content
            ],
            findCard: function(element) {
                // For CNN-specific containers
                let container = element.closest('.container_headline, .container_title, .container__headline, .container__title');
                if (container) {
                    return container.closest('div, section, article');
                }
                
                return element.closest('.card, .container_lead-plus-headlines__link, article, .cd, .zone');
            },
            processParagraphs: function() {
                // Remove individual paragraphs with blocked content
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'foxnews.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                '.headline', '.title', '.story-title',
                'a[href]', 'img[src]', 'img[srcset]',
                'article', '.article', '.story',
                'p' // Check paragraphs
            ],
            findCard: function(element) {
                // If it's an anchor, image, or has href/srcset, find the article container
                if (element.tagName === 'A' || element.tagName === 'IMG' || 
                    element.hasAttribute('href') || element.hasAttribute('srcset')) {
                    return element.closest('article.article, article.story, .article.small.river.story, .article-list, [class*="article"]');
                }
                
                return element.closest('article, .story-wrap, .article-wrap, [class*="article"], [class*="story"]');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'politico.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                '.headline', '.title',
                'a[href*="/news/"]', 'a[href*="/story/"]'
            ],
            findCard: function(element) {
                return element.closest('article, .story-wrap, .summary');
            }
        },
        'washingtonpost.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                '.headline', '.title',
                'a[data-pb-local-content-field="web_headline"]'
            ],
            findCard: function(element) {
                return element.closest('article, .story-list-story, .border-bottom');
            }
        },
        'nytimes.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                '.css-1l4spti', '.css-9mylee',
                'a[href]', 'img[src]', 'img[srcset]',
                'p.indicate_hover', 'p.summary-class',
                '.tpl-lbl.css-5mgoji',
                'p'
            ],
            findCard: function(element) {
                // If href contains keyword, remove the entire tpl-lbl container
                if (element.tagName === 'A' && element.hasAttribute('href')) {
                    return element.closest('.tpl-lbl.css-5mgoji') || element.closest('article, li, .story-wrapper');
                }
                return element.closest('article, li, .story-wrapper, .tpl-lbl');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'washingtonpost.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                '.headline', '.title',
                'a[href]', 'img[src]', 'img[srcset]',
                'a[data-pb-local-content-field="web_headline"]',
                'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .story-list-story, .border-bottom');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'nbcnews.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .story-wrap, .tease-card');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'abcnews.go.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .story-wrap, .ContentRoll__Item');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'cbsnews.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .item, .media');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'usatoday.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .story-asset, .card');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'npr.org': {
            headlines: [
                'h1', 'h2', 'h3',
                'img[src]', 'a[href]'
            ],
            findCard: function(element) {
                return element.closest('article, .item-wrap, .story-wrap');
            }
        },
        'reuters.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'span', 'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .story-collection, .media-story-card');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'apnews.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'span[title]', 'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .FeedCard, .Card');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'msnbc.com': {
            headlines: [
                'h1', 'h2', 'h3', 'h4',
                'a[href]', 'img[src]', 'img[srcset]',
                'span[title]', 'p', 'nav'
            ],
            findCard: function(element) {
                return element.closest('article, .tease-card, .story-body');
            },
            processParagraphs: function() {
                document.querySelectorAll('p').forEach(p => {
                    if (containsBlockedContent(p.textContent)) {
                        hideElement(p);
                    }
                });
            }
        },
        'reddit.com': {
            headlines: [
                'h1', 'h2', 'h3',
                '[data-testid="post-content"]', 
                '[data-click-id="body"]',
                '.title', '.usertext-body',
                'a[data-click-id="body"]',
                '.md p' // Comments
            ],
            findCard: function(element) {
                return element.closest('[data-testid="post-container"], .Post, .thing, .comment');
            },
            processComments: function() {
                // Remove comments with blocked content
                document.querySelectorAll('.comment .md').forEach(comment => {
                    if (containsBlockedContent(comment.textContent)) {
                        hideElement(comment.closest('.comment'));
                    }
                });
            }
        },
        'x.com': {
            headlines: [
                '[data-testid="tweetText"]',
                '[data-testid="User-Name"]',
                '[data-testid="UserDescription"]',
                '[role="link"]',
                'span'
            ],
            findCard: function(element) {
                return element.closest('[data-testid="tweet"], [data-testid="cellInnerDiv"], article');
            },
            processProfiles: function() {
                // Block profiles with keywords in name or bio
                document.querySelectorAll('[data-testid="UserName"], [data-testid="UserDescription"]').forEach(profile => {
                    if (containsBlockedContent(profile.textContent)) {
                        // Hide the entire profile
                        const profileCard = profile.closest('[data-testid="UserCell"], [data-testid="cellInnerDiv"]');
                        if (profileCard) hideElement(profileCard);
                    }
                });
            },
            processTweets: function() {
                // Remove tweets and their sub-comments
                document.querySelectorAll('[data-testid="tweet"]').forEach(tweet => {
                    const tweetText = tweet.querySelector('[data-testid="tweetText"]');
                    if (tweetText && containsBlockedContent(tweetText.textContent)) {
                        hideElement(tweet);
                    }
                });
            }
        }
    };

    let settings = {
        categories: {
            trump: false,
            vance: false,
            rightwing: false,
            redpill: false,
            foxnews: false,
            redpillcontent: false
        },
        customKeywords: '',
        isPremium: false
    };

    let blockedCount = 0;

    async function loadSettings() {
        try {
            if (!chrome?.storage?.sync) {
                settings.categories.trump = true;
                return;
            }
            
            const stored = await chrome.storage.sync.get(settings);
            settings = { ...settings, ...stored };
            
            if (!settings.isPremium) {
                settings.customKeywords = '';
            }
            
            if (!settings.categories) {
                settings.categories = {
                    trump: true,
                    vance: false,
                    rightwing: false,
                    redpill: false,
                    foxnews: false,
                    redpillcontent: false
                };
            }
            
            const hasEnabledCategories = Object.values(settings.categories).some(val => val === true);
            if (!hasEnabledCategories) {
                settings.categories.trump = true;
            }
            
        } catch (error) {
            settings.categories.trump = true;
        }
    }

    function getActiveKeywords() {
        let keywords = [];
        
        // Only add keywords for enabled categories
        Object.keys(settings.categories || {}).forEach(category => {
            if (settings.categories[category] === true && KEYWORD_LISTS[category]) {
                keywords.push(...KEYWORD_LISTS[category]);
            }
        });

        // Only add custom keywords if any are defined and at least one category is enabled
        if (settings.customKeywords && settings.isPremium) {
            const customKeywords = settings.customKeywords
                .split(',')
                .map(k => k.trim().toLowerCase())
                .filter(k => k.length > 0);
            if (customKeywords.length > 0) {
                keywords.push(...customKeywords);
            }
        }

        const uniqueKeywords = [...new Set(keywords)];
        return uniqueKeywords;
    }

    function containsBlockedContent(text) {
        if (!text) {
            return false;
        }
        
        const lowerText = text.toLowerCase();
        const keywords = getActiveKeywords();
        
        if (keywords.length === 0) {
            return false; // No keywords to block
        }
        
        
        const result = keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
        
        return result;
    }

    function hideElement(element) {
        if (element.classList.contains('trump-blocker-hidden')) return;
        
        element.classList.add('trump-blocker-hidden');
        element.style.display = 'none';
        
        // Silently remove the element - no placeholder needed
        blockedCount++;
    }

    // Get current site adapter
    function getCurrentSiteAdapter() {
        const hostname = window.location.hostname;
        for (const domain in siteAdapters) {
            if (hostname.includes(domain)) {
                return siteAdapters[domain];
            }
        }
        return null;
    }

    // Extract headline text from element with site-specific logic
    function extractHeadlineText(element, siteAdapter) {
        let headlineText = '';
        
        // Get text content
        headlineText += element.textContent || '';
        
        // Get title attribute
        headlineText += ' ' + (element.title || '');
        
        // Get aria-label
        headlineText += ' ' + (element.getAttribute('aria-label') || '');
        
        // For links, get href for URL-based detection
        if (element.tagName === 'A') {
            const href = element.href || '';
            headlineText += ' ' + href;
            
            // For Fox News, be more aggressive in text extraction
            if (window.location.hostname.includes('foxnews.com')) {
                // Check all nested elements for text content
                const nestedText = Array.from(element.querySelectorAll('*'))
                    .map(el => (el.textContent || '').trim())
                    .filter(text => text.length > 0)
                    .join(' ');
                headlineText += ' ' + nestedText;
                
                // Also check parent container text
                const parent = element.closest('.info-header, .story-info, .article-info, div, li');
                if (parent) {
                    headlineText += ' ' + (parent.textContent || '');
                }
            }
        }
        
        // For images, get alt text and src
        if (element.tagName === 'IMG') {
            headlineText += ' ' + (element.alt || '');
            headlineText += ' ' + (element.src || '');
        }
        
        return headlineText.toLowerCase().trim();
    }

    // Find and remove associated images for blocked content
    function removeAssociatedImages(blockedElement) {
        if (!blockedElement) return;

        // Strategy 1: Remove images from the immediate article/card container
        const container = blockedElement.closest('article, .card, .story, .post, li, div[class*="item"], div[class*="story"], div[class*="article"], [data-uuid]') || blockedElement;
        
        // Remove all images within the same container
        const images = container.querySelectorAll('img, picture, [style*="background-image"]');
        images.forEach(img => {
            hideElement(img);
        });

        // Strategy 2: Remove image containers
        const imageContainers = container.querySelectorAll(
            '.image, .photo, .thumbnail, .media, .picture, ' +
            '[class*="image"], [class*="photo"], [class*="thumb"], [class*="media"], ' +
            'figure, .figure, .img-container, .media-container'
        );
        imageContainers.forEach(imgContainer => {
            hideElement(imgContainer);
        });

        // Strategy 3: Look for images in sibling elements (common in news layouts)
        const parent = blockedElement.parentElement;
        if (parent) {
            Array.from(parent.children).forEach(sibling => {
                if (sibling.tagName === 'IMG' || 
                    sibling.querySelector('img') || 
                    sibling.style.backgroundImage ||
                    sibling.classList.toString().match(/image|photo|thumb|media/i)) {
                    hideElement(sibling);
                }
            });
        }

        // Strategy 4: Look for images in parent containers (for nested layouts)
        let searchParent = blockedElement.parentElement;
        let depth = 0;
        while (searchParent && depth < 3) { // Search up to 3 levels
            const nearbyImages = searchParent.querySelectorAll('img');
            nearbyImages.forEach(img => {
                // Only hide if this image is likely associated with this article
                if (img.closest('li, article, .card, [data-uuid]') === container) {
                    hideElement(img);
                }
            });
            searchParent = searchParent.parentElement;
            depth++;
        }
    }

    // Check if element is a main container that shouldn't be hidden
    function isMainContainer(element) {
        const tagName = element.tagName.toLowerCase();
        const classList = Array.from(element.classList);
        
        // Don't hide these major containers
        if (['body', 'main', 'header', 'footer', 'nav'].includes(tagName)) {
            return true;
        }
        
        // Don't hide if it contains too much content
        if (element.children.length > 20 || element.textContent.length > 5000) {
            return true;
        }
        
        // Don't hide navigation or menu containers
        if (classList.some(cls => ['nav', 'menu', 'header', 'footer', 'sidebar'].some(term => cls.includes(term)))) {
            return true;
        }
        
        return false;
    }

    // Hide element with layout preservation
    function hideElementSafely(element) {
        if (element.classList.contains('trump-blocker-hidden')) return;
        if (isMainContainer(element)) return;
        
        // Store original dimensions
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--original-height', rect.height + 'px', 'important');
        element.style.setProperty('--original-width', rect.width + 'px', 'important');
        
        element.classList.add('trump-blocker-hidden');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('height', '0', 'important');
        element.style.setProperty('overflow', 'hidden', 'important');
        element.style.setProperty('margin', '0', 'important');
        element.style.setProperty('padding', '0', 'important');
        
        blockedCount++;
    }

    // Blur Trump images
    function blurTrumpImage(img) {
        if (img.dataset.trumpBlockerBlurred) return;
        
        img.dataset.trumpBlockerBlurred = 'true';
        img.style.setProperty('filter', 'blur(12px) brightness(0.4)', 'important');
        img.style.setProperty('opacity', '0.6', 'important');
    }

    // Remove paragraphs containing blocked content within articles
    function filterArticleParagraphs() {
        if (!getActiveKeywords().length) return;
        
        // Find article content areas and paragraphs
        const articleSelectors = [
            'article .article-body p', 'article .content p', 'article .story-body p',
            '.article-content p', '.story-content p', '.post-content p',
            '[class*="article"] p', '[class*="story"] p', '[class*="content"] p',
            // Also check article previews/snippets
            '.article-preview', '.story-preview', '.excerpt', '.summary',
            '.article-snippet', '.story-snippet', '.preview-text'
        ];
        
        articleSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (containsBlockedContent(element.textContent)) {
                    hideElementSafely(element);
                }
            });
        });
    }

    // Remove buttons, links, ads mentioning Trump
    function filterButtons() {
        if (!getActiveKeywords().length) return;
        
        const buttonSelectors = [
            'button', 'a[role="button"]', '.btn', '.button',
            '[class*="button"]', '[class*="btn"]'
        ];
        
        buttonSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(button => {
                if (button.closest('.trump-blocker-hidden')) return;
                
                const buttonText = (button.textContent || '') + ' ' + 
                                 (button.getAttribute('aria-label') || '') + ' ' +
                                 (button.title || '');
                
                if (containsBlockedContent(buttonText)) {
                    hideElementSafely(button);
                }
            });
        });
    }

    // Remove ads mentioning Trump
    function filterAds() {
        if (!getActiveKeywords().length) return;
        
        const adSelectors = [
            '[class*="ad"]', '[class*="advertisement"]', '[id*="ad"]',
            '.sponsored', '.promo', '[class*="sponsor"]',
            'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]'
        ];
        
        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(ad => {
                if (ad.closest('.trump-blocker-hidden')) return;
                
                const adText = (ad.textContent || '') + ' ' + 
                              (ad.getAttribute('alt') || '') + ' ' +
                              (ad.src || '');
                
                if (containsBlockedContent(adText)) {
                    hideElementSafely(ad);
                }
            });
        });
    }

    function scanForBlockedContent() {
        // Only proceed if at least one category is enabled
        const hasActiveCategories = Object.values(settings.categories).some(isEnabled => isEnabled);
        
        if (!hasActiveCategories && !settings.customKeywords) {
            return;
        }

        const keywords = getActiveKeywords();
        
        if (keywords.length === 0) {
            return;
        }

        // Check if we have a site-specific adapter
        const currentAdapter = getCurrentSiteAdapter();
        
        if (currentAdapter) {
            if (currentAdapter.processComplete) {
                currentAdapter.processComplete();
                return; // Exit early since we used site-specific logic
            }
        }
        
        // DIRECT APPROACH: Remove ANY element containing blocked keywords
        
        // FOR YOUTUBE: Block ALL videos and shorts containing "Trump"
        if (window.location.hostname.includes('youtube') || window.location.hostname.includes('youtu.be')) {
            
            // Find all video containers first, then check their content
            const videoContainers = document.querySelectorAll([
                'ytd-video-renderer',
                'ytd-compact-video-renderer',
                'ytd-grid-video-renderer', 
                'ytd-rich-item-renderer',
                'ytd-reel-item-renderer',
                'ytd-shorts-lockup-view-model',
                '#dismissible'
            ].join(','));
            
            
            videoContainers.forEach(container => {
                if (container.classList.contains('trump-blocker-hidden')) return;
                
                // Get ALL text and links within this video container
                const allText = container.textContent || '';
                const allLinks = container.querySelectorAll('a[href]');
                let allHrefs = '';
                allLinks.forEach(link => {
                    allHrefs += ' ' + (link.href || '');
                });
                
                const combinedContent = allText + ' ' + allHrefs;
                
                // Check if this video container has blocked content
                if (containsBlockedContent(combinedContent)) {
                    hideElement(container);
                }
            });
        }
        
        // Check ALL elements on the page
        document.querySelectorAll('*').forEach(element => {
            // Skip already hidden elements
            if (element.classList.contains('trump-blocker-hidden')) return;
            
            // Skip critical page elements
            if (['HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'META', 'LINK'].includes(element.tagName)) return;
            
            // Get all text from this element
            let elementText = '';
            
            // Check text content
            elementText += element.textContent || '';
            
            // Check all attributes
            for (let attr of element.attributes || []) {
                elementText += ' ' + (attr.value || '');
            }
            
            // For images, check src, alt, title
            if (element.tagName === 'IMG') {
                elementText += ' ' + (element.src || '');
                elementText += ' ' + (element.alt || '');
                elementText += ' ' + (element.title || '');
            }
            
            // For links, check href
            if (element.tagName === 'A') {
                elementText += ' ' + (element.href || '');
            }
            
            // Check if this element contains blocked keywords
            if (containsBlockedContent(elementText)) {
                hideElement(element);
            }
        });

        // STEP 2: Run site-specific processing if available
        const siteAdapter = getCurrentSiteAdapter();
        if (siteAdapter) {
            // Run site-specific processing functions
            if (siteAdapter.processComments) siteAdapter.processComments();
            if (siteAdapter.processParagraphs) siteAdapter.processParagraphs();
            if (siteAdapter.processProfiles) siteAdapter.processProfiles();
            if (siteAdapter.processTweets) siteAdapter.processTweets();
            if (siteAdapter.processComplete) siteAdapter.processComplete();
        }
    }

    function updateBadge() {
        if (typeof chrome !== 'undefined' && chrome.action) {
            chrome.action.setBadgeText({
                text: blockedCount > 0 ? blockedCount.toString() : ''
            });
            chrome.action.setBadgeBackgroundColor({color: '#ff6b6b'});
        }
    }

    // Comprehensive content restoration function
    function restoreAllContent() {
        const hiddenElements = document.querySelectorAll('.trump-blocker-hidden');
        
        hiddenElements.forEach((el, index) => {
            
            // Remove our marker class
            el.classList.remove('trump-blocker-hidden');
            
            // Restore display (from hideElement method)
            el.style.display = '';
            el.style.removeProperty('display');
            
            // Restore hideElementSafely method properties (if any)
            el.style.removeProperty('visibility');
            el.style.removeProperty('height');
            el.style.removeProperty('overflow');
            el.style.removeProperty('margin');
            el.style.removeProperty('padding');
            
            // Restore blurred images
            if (el.dataset.trumpBlockerBlurred) {
                delete el.dataset.trumpBlockerBlurred;
                el.style.removeProperty('filter');
                el.style.removeProperty('opacity');
            }
            
            // Make sure element is visible
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        });
    }

    // Listen for settings updates
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SETTINGS_UPDATED') {
            settings = message.settings;
            
            // Always restore ALL hidden content first
            restoreAllContent();
            
            // Reset counter
            blockedCount = 0;
            
            // Rebuild YouTube regex with new settings
            if (window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be')) {
                buildYTRegex().then(() => {
                    ytState.processedNodes = new WeakSet();
                    ytState.filteredCount = 0;
                    ytState.pageHotUntil = Date.now() + 3000; // Hot for 3s after settings change
                });
            }
            
            // Check if any categories are still enabled
            const hasActiveCategories = Object.values(settings.categories).some(isEnabled => isEnabled);
            
            if (hasActiveCategories || settings.customKeywords) {
                // Wait a moment for DOM to update, then re-scan with new settings
                setTimeout(() => {
                    scanForBlockedContent();
                    
                    // Also trigger YouTube scan if on YouTube
                    if (window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be')) {
                        scheduleYTScan();
                    }
                    
                    updateBadge();
                }, 200); // Longer delay to ensure restoration completes
            } else {
                updateBadge();
            }
            
            sendResponse({success: true});
        }
    });

    // Removed automatic settings reset to prevent interference

    // YouTube SPA-aware filtering state
    let ytState = {
        scopedObserver: null,
        attributeObserver: null,
        currentContainer: null,
        pendingNodes: new Set(),
        processedNodes: new WeakSet(),
        scanScheduled: false,
        filteredCount: 0,
        lastUrl: location.href,
        combinedRegex: null,
        matcherReady: false,
        pageHotUntil: 0 // timestamp for hot page rescans
    };

    // YouTube renderer selectors (outer containers)
    const YT_RENDERERS = [
        'ytd-rich-item-renderer',
        'ytd-video-renderer', 
        'ytd-grid-video-renderer',
        'ytd-compact-video-renderer',
        'ytd-compact-radio-renderer',
        'ytd-playlist-renderer',
        'ytd-reel-item-renderer',
        'ytd-rich-section-renderer'
    ].join(', ');

    // Container selectors by page type
    const YT_CONTAINERS = {
        search: ['ytd-search #contents', 'ytd-two-column-browse-results-renderer #contents', 'ytd-section-list-renderer #contents'],
        home: ['ytd-rich-grid-renderer #contents'],
        watch: ['ytd-watch-next-secondary-results-renderer', '#secondary']
    };

    async function buildYTRegex() {
        
        ytState.matcherReady = false;
        const activeKeywords = [];
        const enabledCategories = [];
        
        // Get enabled categories from KEYWORD_LISTS - check key mapping carefully
        Object.keys(settings.categories || {}).forEach(category => {
            if (settings.categories[category] === true && KEYWORD_LISTS[category]) {
                enabledCategories.push(category);
                activeKeywords.push(...KEYWORD_LISTS[category]);
            }
        });

        // Add custom keywords if premium
        if (settings.customKeywords && settings.isPremium) {
            const customKeywords = settings.customKeywords
                .split(',')
                .map(k => k.trim().toLowerCase())
                .filter(k => k.length > 0);
            if (customKeywords.length > 0) {
                activeKeywords.push(...customKeywords);
            }
        }


        if (activeKeywords.length === 0) {
            ytState.combinedRegex = null;
            ytState.matcherReady = true; // Ready but empty
            return;
        }

        try {
            const normalized = activeKeywords
                .map(k => k.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, ''))
                .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .filter(k => k.length > 0);

            const pattern = '\\b(' + normalized.join('|') + ')\\b';
            ytState.combinedRegex = new RegExp(pattern, 'iu');
        } catch (error) {
            ytState.combinedRegex = null;
        }
        
        ytState.matcherReady = true;
    }

    function testYTMatch(text) {
        if (!text || !ytState.combinedRegex) return false;

        const normalized = text.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '');
        
        // False positive guard
        if (/\btrumpet(s)?\b/i.test(normalized)) {
            return false;
        }

        const result = ytState.combinedRegex.test(normalized);
        

        return result;
    }

    function setupYTNavigation() {
        // Patch history
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(...args) {
            originalPushState.apply(this, args);
            window.dispatchEvent(new CustomEvent('locationchange'));
        };

        history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            window.dispatchEvent(new CustomEvent('locationchange'));
        };

        // Listen for navigation
        window.addEventListener('locationchange', handleYTRoute);
        window.addEventListener('popstate', handleYTRoute);
        window.addEventListener('yt-navigate-finish', handleYTRoute);
        window.addEventListener('yt-page-data-updated', handleYTRoute);
    }

    function handleYTRoute() {
        if (location.href !== ytState.lastUrl) {
            ytState.lastUrl = location.href;
            onYTRouteChange();
        }
    }

    async function onYTRouteChange() {
        
        // Reset state
        ytState.filteredCount = 0;
        ytState.pendingNodes.clear();
        ytState.processedNodes = new WeakSet();
        ytState.pageHotUntil = Date.now() + 8000; // Hot for 8 seconds

        // Disconnect old observers
        if (ytState.scopedObserver) {
            ytState.scopedObserver.disconnect();
            ytState.scopedObserver = null;
        }
        if (ytState.attributeObserver) {
            ytState.attributeObserver.disconnect();
            ytState.attributeObserver = null;
        }

        // Rebuild regex - CRITICAL: await this
        await buildYTRegex();

        // Only bind observer if matcher is ready
        if (ytState.matcherReady) {
            await bindYTObserver();
        }
    }

    async function bindYTObserver() {
        let container = null;
        let containerSelectors = [];
        let pageType = 'unknown';

        // Determine page type and selectors
        if (location.pathname.startsWith('/results') || location.search.includes('search_query') || document.querySelector('ytd-search')) {
            containerSelectors = YT_CONTAINERS.search;
            pageType = 'search';
        } else if (location.pathname === '/' || location.pathname.startsWith('/feed/')) {
            containerSelectors = YT_CONTAINERS.home; // Critical for homepage
            pageType = 'home';
        } else if (location.pathname.startsWith('/watch')) {
            containerSelectors = YT_CONTAINERS.watch;
            pageType = 'watch';
        } else {
            containerSelectors = [...YT_CONTAINERS.home, ...YT_CONTAINERS.search];
            pageType = 'fallback';
        }


        // Wait for container
        for (const selector of containerSelectors) {
            container = await waitForYTElement(selector, 4000);
            if (container) {
                break;
            }
        }

        if (!container) {
            container = document.documentElement;
        }

        ytState.currentContainer = container;

        // Create main observer for added nodes
        ytState.scopedObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            ytState.pendingNodes.add(node);
                        }
                    }
                }
            }
            scheduleYTScan();
        });

        // Create attribute observer for late-arriving titles
        ytState.attributeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' || mutation.type === 'characterData') {
                    const element = mutation.target;
                    // Find the renderer ancestor
                    const renderer = element.closest(YT_RENDERERS);
                    if (renderer && !ytState.processedNodes.has(renderer)) {
                        ytState.pendingNodes.add(renderer);
                        scheduleYTScan();
                    }
                }
            }
        });

        // Attach observers
        ytState.scopedObserver.observe(container, {
            childList: true,
            subtree: true
        });

        // Watch for attribute changes on title elements
        if (container !== document.documentElement) {
            ytState.attributeObserver.observe(container, {
                subtree: true,
                attributes: true,
                characterData: true,
                attributeFilter: ['title', 'aria-label']
            });
        }

        // Immediate scan
        scheduleYTScan();
    }

    function waitForYTElement(selector, timeout = 3000) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }

    function scheduleYTScan() {
        if (ytState.scanScheduled) return;
        ytState.scanScheduled = true;

        const rafId = requestAnimationFrame(performYTScan);
        const timeoutId = setTimeout(() => {
            cancelAnimationFrame(rafId);
            performYTScan();
        }, 120);

        function performYTScan() {
            clearTimeout(timeoutId);
            cancelAnimationFrame(rafId);
            ytState.scanScheduled = false;
            executeYTScan();
        }
    }

    function executeYTScan() {
        // Gate scans until matcher is ready
        if (!ytState.matcherReady) {
            return;
        }

        if (!ytState.combinedRegex) {
            ytState.pendingNodes.clear();
            return;
        }

        const candidates = new Set();

        // Process pending nodes
        for (const node of ytState.pendingNodes) {
            // Check if node is renderer
            if (node.matches && node.matches(YT_RENDERERS)) {
                if (!ytState.processedNodes.has(node) && !node.hasAttribute('data-filtered')) {
                    candidates.add(node);
                }
            }

            // Check children for renderers
            if (node.querySelectorAll) {
                const childRenderers = node.querySelectorAll(YT_RENDERERS);
                for (const renderer of childRenderers) {
                    if (!ytState.processedNodes.has(renderer) && !renderer.hasAttribute('data-filtered')) {
                        candidates.add(renderer);
                    }
                }
            }

            // Walk up to find renderer ancestors - more resilient detection
            let current = node.parentElement;
            while (current && current !== ytState.currentContainer) {
                if (current.matches && current.matches(YT_RENDERERS)) {
                    if (!ytState.processedNodes.has(current) && !current.hasAttribute('data-filtered')) {
                        candidates.add(current);
                        break;
                    }
                }
                // Fallback: any YTD-*-RENDERER element
                if (current.tagName && current.tagName.startsWith('YTD-') && current.tagName.endsWith('-RENDERER')) {
                    if (!ytState.processedNodes.has(current) && !current.hasAttribute('data-filtered')) {
                        candidates.add(current);
                        break;
                    }
                }
                current = current.parentElement;
            }
        }

        // Scan existing renderers in container on initial load
        if (ytState.currentContainer && ytState.currentContainer !== document.documentElement) {
            const existingRenderers = ytState.currentContainer.querySelectorAll(YT_RENDERERS);
            for (const renderer of existingRenderers) {
                if (!ytState.processedNodes.has(renderer) && !renderer.hasAttribute('data-filtered')) {
                    candidates.add(renderer);
                }
            }
        }

        ytState.pendingNodes.clear();

        // Process candidates (with budget limit)
        const candidatesArray = Array.from(candidates);
        let processed = 0;
        const BUDGET = 300;

        for (const candidate of candidatesArray) {
            if (processed >= BUDGET) {
                // Continue next tick
                for (let i = processed; i < candidatesArray.length; i++) {
                    ytState.pendingNodes.add(candidatesArray[i]);
                }
                scheduleYTScan();
                break;
            }

            processYTCandidate(candidate);
            processed++;
        }
        
    }

    function processYTCandidate(element) {
        ytState.processedNodes.add(element);

        try {
            const text = extractYTText(element);
            const isMatch = testYTMatch(text);
            
            // Debug logging for search results
            if (location.pathname.startsWith('/results')) {
                const title = element.querySelector('#video-title, a#video-title, yt-formatted-string#video-title')?.textContent?.trim() || '';
                if (text && text.length > 0) {
                }
            }
            
            if (isMatch) {
                element.setAttribute('data-filtered', '1');
                ytState.filteredCount++;
            }
        } catch (error) {
        }
    }

    function extractYTText(element) {
        const texts = [];
        
        try {
            // Comprehensive title extraction - covers more variants
            const titleSelectors = [
                '#video-title', 'a#video-title', '#video-title-link',
                'yt-formatted-string#video-title', 'h3 a', 'a#title', 
                'span#title', '[id*="video-title"]'
            ];
            
            titleSelectors.forEach(selector => {
                const el = element.querySelector(selector);
                if (el) {
                    // Text content
                    texts.push(el.textContent || el.innerText || '');
                    // Title attribute
                    if (el.title) texts.push(el.title);
                    // Aria-label
                    if (el.getAttribute && el.getAttribute('aria-label')) {
                        texts.push(el.getAttribute('aria-label'));
                    }
                    // Parent link attributes
                    const parentLink = el.closest('a');
                    if (parentLink) {
                        if (parentLink.title) texts.push(parentLink.title);
                        if (parentLink.getAttribute('aria-label')) {
                            texts.push(parentLink.getAttribute('aria-label'));
                        }
                    }
                }
            });

            // Channel name
            const channelSelectors = [
                'ytd-channel-name a', '#channel-name a', 
                '#text.ytd-channel-name', '.ytd-channel-name #text'
            ];
            channelSelectors.forEach(selector => {
                const el = element.querySelector(selector);
                if (el) texts.push(el.textContent || el.innerText || '');
            });

            // Description/snippet
            const descSelectors = [
                '#description', '#description-text', '#snippet-text', 
                '#metadata-line', '.description-snippet'
            ];
            descSelectors.forEach(selector => {
                const el = element.querySelector(selector);
                if (el) texts.push(el.textContent || el.innerText || '');
            });

            // Thumbnail alt text
            const img = element.querySelector('img[alt]');
            if (img && img.alt) texts.push(img.alt);

            // Link href (sometimes contains keywords)
            const links = element.querySelectorAll('a[href]');
            links.forEach(link => {
                if (link.href && link.href.includes('/watch')) {
                    texts.push(decodeURIComponent(link.href));
                }
            });

            // Fallback to element text
            if (texts.length === 0) {
                texts.push(element.textContent || element.innerText || '');
            }

        } catch (error) {
            // Safe fallback
            texts.push(element.textContent || element.innerText || '');
        }

        const combinedText = texts.join(' ').trim();
        return combinedText;
    }

    async function initYTFunctionality() {
        
        if (window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be')) {
            
            await buildYTRegex();
            setupYTNavigation();
            await bindYTObserver();
            
            // Hot page rescanning - frequent scans for first 8 seconds after nav
            setInterval(() => {
                if (ytState.matcherReady && ytState.combinedRegex && Date.now() < ytState.pageHotUntil) {
                    scheduleYTScan();
                }
            }, 1000);
            
            // Safety net scan every 2s always
            setInterval(() => {
                if (ytState.matcherReady && ytState.combinedRegex) {
                    scheduleYTScan();
                }
            }, 2000);
            
        }
    }

    // Initialize
    loadSettings().then(() => {
        // Initial scan
        scanForBlockedContent();
        updateBadge();
        
        // Initialize YouTube functionality
        initYTFunctionality();
        
        // For YouTube, set up additional scanning for live streams and dynamic content
        if (window.location.hostname.includes('youtube.com') || window.location.hostname.includes('youtu.be')) {
            
            // Check if this is a live stream
            if (window.location.href.includes('/live/')) {
            }
            
            // Scan again after a short delay for YouTube's dynamic loading
            setTimeout(() => {
                scanForBlockedContent();
            }, 2000);
            
            // Scan again after longer delay for slow-loading content
            setTimeout(() => {
                scanForBlockedContent();
            }, 5000);
            
            // For live streams, scan even more frequently
            if (window.location.href.includes('/live/')) {
                setTimeout(() => {
                    scanForBlockedContent();
                }, 8000);
            }
        }

        // Set up mutation observer for dynamic content
        const observer = new MutationObserver((mutations) => {
            
            // Don't process mutations if no categories are active
            const hasActiveCategories = Object.values(settings.categories).some(isEnabled => isEnabled);
            if (!hasActiveCategories && !settings.customKeywords) {
                return; // Completely disabled
            }
            
            let shouldScan = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for any new images or content containers (but not on Facebook)
                            if (node.matches && (
                                node.matches('img') ||
                                node.matches('[class*="trending"], [class*="popular"]') ||
                                node.matches('article, [role="article"]') ||
                                node.matches('[class*="article"], [class*="story"], [class*="post"]') ||
                                node.querySelector('img') ||
                                node.querySelector('[class*="trending"], [class*="popular"]') ||
                                node.querySelector('article, [class*="article"], [class*="story"]')
                            )) {
                                shouldScan = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldScan) {
                setTimeout(() => {
                    // Quick scan of just new images and trending content
                    document.querySelectorAll('img').forEach(img => {
                        if (img.closest('.trump-blocker-hidden')) return;
                        
                        const imageText = (img.alt || '') + ' ' + (img.src || '') + ' ' + (img.title || '') + ' ' + (img.getAttribute('data-src') || '');
                        if (containsBlockedContent(imageText)) {
                            hideElement(img);
                        }
                    });
                    
                    updateBadge();
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
            // Removed characterData and attributes monitoring to be less aggressive
        });

        // Periodic re-scan for sites with complex dynamic loading 
        setInterval(() => {
            const hasActiveCategories = Object.values(settings.categories).some(isEnabled => isEnabled);
            if (!hasActiveCategories && !settings.customKeywords) {
                return; // Don't scan if disabled
            }
            
            scanForBlockedContent();
            updateBadge();
        }, 5000); // Every 5 seconds for all sites including Facebook
    });

})();