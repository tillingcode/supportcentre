// Support Centre - Main JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize all components
    initMobileMenu();
    initAccordion();
    initSmoothScroll();
    initScrollEffects();
    initEntranceAnimations();
    initSearch();
    await initFeedbackButtons();
    initComments();
    fetchRSSFeeds();
    initClickTracking();
    initRecommendations();
});

// Header scroll effect
function initScrollEffects() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        // Add scrolled class for shadow
        if (currentScroll > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// Staggered entrance animations
function initEntranceAnimations() {
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Stagger helpline cards
    document.querySelectorAll('.helpline-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (i * 100));
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

// Accordion Functionality
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');

            // Close all accordion items
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't already active
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Fetch RSS Feeds
async function fetchRSSFeeds() {
    const feedContainer = document.getElementById('rss-feed');
    
    if (!feedContainer) return;

    // RSS Feed URLs - using a CORS proxy for client-side fetching
    const feeds = [
        {
            url: 'https://whatsyourgrief.com/feed/',
            name: "What's Your Grief"
        }
    ];

    // Using RSS2JSON API for CORS-friendly RSS fetching
    const rss2jsonBase = 'https://api.rss2json.com/v1/api.json?rss_url=';

    let allArticles = [];

    try {
        for (const feed of feeds) {
            try {
                const response = await fetch(rss2jsonBase + encodeURIComponent(feed.url));
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.status === 'ok' && data.items) {
                        const articles = data.items.slice(0, 6).map(item => ({
                            title: item.title,
                            link: item.link,
                            description: stripHtml(item.description).substring(0, 180) + '...',
                            pubDate: formatDate(item.pubDate),
                            source: feed.name
                        }));
                        allArticles = allArticles.concat(articles);
                    }
                }
            } catch (error) {
                console.log(`Error fetching ${feed.name}:`, error);
            }
        }

        // Display articles or fallback content
        if (allArticles.length > 0) {
            displayArticles(feedContainer, allArticles);
        } else {
            displayFallbackContent(feedContainer);
        }
    } catch (error) {
        console.error('Error fetching RSS feeds:', error);
        displayFallbackContent(feedContainer);
    }
}

// Display articles in the grid
function displayArticles(container, articles) {
    container.innerHTML = articles.map(article => `
        <article class="article-card">
            <div class="article-date">${article.pubDate} • ${article.source}</div>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.description)}</p>
            <a href="${article.link}" target="_blank" rel="noopener" class="article-link">Read More →</a>
        </article>
    `).join('');
}

// Display fallback content when RSS fails
function displayFallbackContent(container) {
    const fallbackArticles = [
        {
            title: "Understanding Grief: It's Not a Straight Line",
            description: "Grief doesn't follow a predictable path. Learn about the natural ebbs and flows of the grieving process and why there's no 'right' way to grieve.",
            link: "https://whatsyourgrief.com",
            source: "What's Your Grief"
        },
        {
            title: "Coping with Loss During the Holidays",
            description: "The holiday season can be especially difficult when you're grieving. Find practical tips for navigating celebrations while honoring your feelings.",
            link: "https://whatsyourgrief.com",
            source: "What's Your Grief"
        },
        {
            title: "Supporting Someone Who is Grieving",
            description: "Want to help but don't know what to say? Learn what really helps someone who is grieving and what to avoid saying.",
            link: "https://www.cruse.org.uk/understanding-grief",
            source: "Cruse Bereavement"
        },
        {
            title: "Looking After Your Mental Health",
            description: "Practical tips and strategies for maintaining good mental health in challenging times. Small steps can make a big difference.",
            link: "https://www.mind.org.uk/information-support/tips-for-everyday-living",
            source: "Mind"
        },
        {
            title: "Living with a Degenerative Condition",
            description: "Advice and support for those living with progressive conditions. Understanding your options and finding the right support network.",
            link: "https://www.alzheimers.org.uk/get-support",
            source: "Alzheimer's Society"
        },
        {
            title: "Self-Care Strategies for Difficult Times",
            description: "When life feels overwhelming, self-care becomes essential. Discover gentle practices to nurture yourself through challenging periods.",
            link: "https://www.mentalhealth.org.uk/explore-mental-health/looking-after-your-mental-health",
            source: "Mental Health Foundation"
        }
    ];

    container.innerHTML = fallbackArticles.map(article => `
        <article class="article-card">
            <div class="article-date">${article.source}</div>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.description)}</p>
            <a href="${article.link}" target="_blank" rel="noopener" class="article-link">Read More →</a>
        </article>
    `).join('');
}

// Helper function to strip HTML tags
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.resource-card, .helpline-card, .tip-card, .article-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ============================================
// CLICK TRACKING & RECOMMENDATIONS SYSTEM
// ============================================

// Content categories and their related topics
const contentCategories = {
    'mental-health': {
        name: 'Mental Health',
        keywords: ['mind', 'mental', 'anxiety', 'depression', 'stress', 'wellbeing', 'therapy', 'counselling', 'psychology', 'rethink', 'sane', 'helpguide', 'beyondblue'],
        related: ['professional-guidance', 'financial-support', 'self-care'],
        resources: [
            { title: 'Mind - Mental Health Support', url: 'https://www.mind.org.uk', description: 'Information and support for mental health problems' },
            { title: 'Rethink Mental Illness', url: 'https://www.rethink.org', description: 'Support for those severely affected by mental illness' },
            { title: 'SANE Mental Health', url: 'https://www.sane.org.uk', description: 'Emotional support and information' },
            { title: 'Mental Health Foundation', url: 'https://www.mentalhealth.org.uk', description: 'Prevention and research' }
        ]
    },
    'grief-loss': {
        name: 'Grief & Loss',
        keywords: ['grief', 'loss', 'bereavement', 'death', 'dying', 'cruse', 'samaritans', 'marie curie', 'funeral', 'mourning'],
        related: ['mental-health', 'financial-support', 'degenerative'],
        resources: [
            { title: 'Cruse Bereavement Support', url: 'https://www.cruse.org.uk', description: 'Free bereavement support' },
            { title: 'Marie Curie', url: 'https://www.mariecurie.org.uk', description: 'End of life care and support' },
            { title: "What's Your Grief", url: 'https://whatsyourgrief.com', description: 'Grief education and resources' },
            { title: 'Samaritans', url: 'https://www.samaritans.org', description: '24/7 listening support' }
        ]
    },
    'degenerative': {
        name: 'Degenerative Conditions',
        keywords: ['alzheimer', 'dementia', 'parkinson', 'mnd', 'motor neurone', 'ms', 'multiple sclerosis', 'progressive', 'neurological'],
        related: ['financial-support', 'grief-loss', 'professional-guidance'],
        resources: [
            { title: "Alzheimer's Society", url: 'https://www.alzheimers.org.uk', description: 'Dementia support and information' },
            { title: "Parkinson's UK", url: 'https://www.parkinsons.org.uk', description: "Support for Parkinson's" },
            { title: 'MND Association', url: 'https://www.mndassociation.org', description: 'Motor Neurone Disease support' },
            { title: 'MS Society', url: 'https://www.mssociety.org.uk', description: 'Multiple Sclerosis support' }
        ]
    },
    'financial-support': {
        name: 'Financial Support',
        keywords: ['money', 'financial', 'benefits', 'pip', 'universal credit', 'esa', 'allowance', 'grants', 'debt', 'carers allowance', 'turn2us', 'citizens advice'],
        related: ['mental-health', 'degenerative', 'carers'],
        resources: [
            { title: 'Turn2us', url: 'https://www.turn2us.org.uk', description: 'Benefits calculator and grants search' },
            { title: 'Citizens Advice', url: 'https://www.citizensadvice.org.uk/benefits', description: 'Free benefits advice' },
            { title: 'Mental Health & Money Advice', url: 'https://mentalhealthandmoneyadvice.org', description: 'Money and mental health support' },
            { title: 'Carers UK Financial Support', url: 'https://www.carersuk.org/help-and-advice/financial-support', description: 'Help for carers' }
        ]
    },
    'professional-guidance': {
        name: 'Professional Guidance',
        keywords: ['nice', 'nhs', 'rcpsych', 'clinical', 'guidelines', 'treatment', 'doctor', 'psychiatrist', 'gp', 'medication'],
        related: ['mental-health', 'degenerative'],
        resources: [
            { title: 'NICE Guidelines', url: 'https://www.nice.org.uk', description: 'Evidence-based healthcare guidance' },
            { title: 'NHS Mental Health', url: 'https://www.nhs.uk/mental-health', description: 'NHS mental health services' },
            { title: 'Royal College of Psychiatrists', url: 'https://www.rcpsych.ac.uk/mental-health', description: 'Trusted mental health information' },
            { title: 'Clinical Knowledge Summaries', url: 'https://cks.nice.org.uk', description: 'Clinical guidance for professionals' }
        ]
    },
    'carers': {
        name: 'Carers Support',
        keywords: ['carer', 'caring', 'caregiver', 'family', 'looking after', 'support someone'],
        related: ['financial-support', 'degenerative', 'mental-health'],
        resources: [
            { title: 'Carers UK', url: 'https://www.carersuk.org', description: 'Support and advice for carers' },
            { title: 'Carers Trust', url: 'https://carers.org', description: 'Help for unpaid carers' },
            { title: 'Dementia UK', url: 'https://www.dementiauk.org', description: 'Admiral Nurses for dementia carers' },
            { title: 'Young Carers', url: 'https://www.childrenssociety.org.uk/what-we-do/our-work/supporting-young-carers', description: 'Support for young carers' }
        ]
    },
    'crisis': {
        name: 'Crisis Support',
        keywords: ['crisis', 'urgent', 'emergency', 'suicide', 'self-harm', 'immediate', 'now', 'help'],
        related: ['mental-health', 'grief-loss'],
        resources: [
            { title: 'Samaritans - 116 123', url: 'https://www.samaritans.org', description: 'Free 24/7 support' },
            { title: 'NHS Crisis - 111', url: 'https://www.nhs.uk/nhs-services/mental-health-services', description: 'NHS mental health crisis' },
            { title: 'CALM - 0800 58 58 58', url: 'https://www.thecalmzone.net', description: 'For men in crisis' },
            { title: 'Shout - Text 85258', url: 'https://giveusashout.org', description: 'Crisis text support' }
        ]
    }
};

// User interaction tracker
const userTracker = {
    storageKey: 'supportcentre_tracking',
    
    // Get tracking data from localStorage
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (e) {
            return this.getDefaultData();
        }
    },
    
    getDefaultData() {
        return {
            clicks: {},           // { category: count }
            lastClicks: [],       // Recent click history
            externalClicks: [],   // External links clicked
            sessionStart: Date.now(),
            totalVisits: 1
        };
    },
    
    // Save tracking data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.log('Could not save tracking data');
        }
    },
    
    // Track a click
    trackClick(category, details = {}) {
        const data = this.getData();
        
        // Increment category count
        data.clicks[category] = (data.clicks[category] || 0) + 1;
        
        // Add to recent history (keep last 20)
        data.lastClicks.unshift({
            category,
            details,
            timestamp: Date.now()
        });
        data.lastClicks = data.lastClicks.slice(0, 20);
        
        this.saveData(data);
        
        // Update recommendations
        updateRecommendationsPanel();
    },
    
    // Track external link click
    trackExternalClick(url, title, category) {
        const data = this.getData();
        
        data.externalClicks.unshift({
            url,
            title,
            category,
            timestamp: Date.now()
        });
        data.externalClicks = data.externalClicks.slice(0, 50);
        
        // Also count as category click
        if (category) {
            data.clicks[category] = (data.clicks[category] || 0) + 1;
        }
        
        this.saveData(data);
        updateRecommendationsPanel();
    },
    
    // Get top interests
    getTopInterests(limit = 3) {
        const data = this.getData();
        const sorted = Object.entries(data.clicks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
        return sorted.map(([category, count]) => ({ category, count }));
    },
    
    // Get recommendations based on user behavior
    getRecommendations() {
        const interests = this.getTopInterests(3);
        const recommendations = [];
        const seen = new Set();
        
        interests.forEach(({ category }) => {
            const catData = contentCategories[category];
            if (!catData) return;
            
            // Add resources from this category
            catData.resources.forEach(resource => {
                if (!seen.has(resource.url)) {
                    seen.add(resource.url);
                    recommendations.push({
                        ...resource,
                        category,
                        relevance: 'primary'
                    });
                }
            });
            
            // Add resources from related categories
            catData.related.forEach(relatedCat => {
                const relatedData = contentCategories[relatedCat];
                if (relatedData) {
                    relatedData.resources.slice(0, 2).forEach(resource => {
                        if (!seen.has(resource.url)) {
                            seen.add(resource.url);
                            recommendations.push({
                                ...resource,
                                category: relatedCat,
                                relevance: 'related'
                            });
                        }
                    });
                }
            });
        });
        
        // If no interests yet, return general recommendations
        if (recommendations.length === 0) {
            return [
                ...contentCategories['mental-health'].resources.slice(0, 2),
                ...contentCategories['grief-loss'].resources.slice(0, 2),
                ...contentCategories['financial-support'].resources.slice(0, 2)
            ].map(r => ({ ...r, relevance: 'general' }));
        }
        
        return recommendations.slice(0, 8);
    },
    
    // Clear tracking data
    clear() {
        localStorage.removeItem(this.storageKey);
    }
};

// Detect category from URL or element
function detectCategory(element) {
    const href = element.getAttribute('href') || '';
    const text = (element.textContent || '').toLowerCase();
    const parentSection = element.closest('section');
    const sectionId = parentSection ? parentSection.id : '';
    
    // Check section ID first
    if (sectionId && contentCategories[sectionId]) {
        return sectionId;
    }
    
    // Check URL and text against keywords
    const searchText = (href + ' ' + text).toLowerCase();
    
    for (const [category, data] of Object.entries(contentCategories)) {
        for (const keyword of data.keywords) {
            if (searchText.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }
    
    return 'general';
}

// Initialize click tracking
function initClickTracking() {
    // Track navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const section = href.substring(1);
                userTracker.trackClick(section, { type: 'navigation' });
            }
        });
    });
    
    // Track resource card clicks
    document.querySelectorAll('.resource-card a').forEach(link => {
        link.addEventListener('click', (e) => {
            const category = detectCategory(link);
            const title = link.closest('.resource-card')?.querySelector('h3')?.textContent || '';
            userTracker.trackExternalClick(link.href, title, category);
        });
    });
    
    // Track helpline clicks
    document.querySelectorAll('.helpline-card a').forEach(link => {
        link.addEventListener('click', (e) => {
            const title = link.closest('.helpline-card')?.querySelector('h3')?.textContent || '';
            userTracker.trackClick('crisis', { type: 'helpline', title });
        });
    });
    
    // Track accordion section opens
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const sectionName = header.querySelector('span:first-child')?.textContent || '';
            const category = detectCategory(header);
            userTracker.trackClick(category, { type: 'accordion', section: sectionName });
        });
    });
    
    // Track all external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        if (!link.hasAttribute('data-tracked')) {
            link.setAttribute('data-tracked', 'true');
            link.addEventListener('click', (e) => {
                const category = detectCategory(link);
                const title = link.textContent || link.getAttribute('title') || '';
                userTracker.trackExternalClick(link.href, title, category);
            });
        }
    });
    
    // Track section visibility
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                const sectionId = entry.target.id;
                if (sectionId && contentCategories[sectionId]) {
                    // Passive tracking - lower weight view
                    const data = userTracker.getData();
                    data.clicks[sectionId] = (data.clicks[sectionId] || 0) + 0.1;
                    userTracker.saveData(data);
                }
            }
        });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });
}

// Create recommendations panel
function initRecommendations() {
    // Create floating recommendations button
    const recButton = document.createElement('button');
    recButton.id = 'recommendations-toggle';
    recButton.innerHTML = '💡';
    recButton.setAttribute('aria-label', 'Show recommendations');
    recButton.title = 'Personalised recommendations based on your interests';
    document.body.appendChild(recButton);
    
    // Create recommendations panel
    const recPanel = document.createElement('div');
    recPanel.id = 'recommendations-panel';
    recPanel.innerHTML = `
        <div class="rec-header">
            <h3>💡 Recommended For You</h3>
            <button class="rec-close" aria-label="Close">&times;</button>
        </div>
        <div class="rec-content">
            <p class="rec-intro">Based on your interests, you might find these helpful:</p>
            <div class="rec-list"></div>
        </div>
        <div class="rec-footer">
            <button class="rec-clear">Clear my browsing data</button>
        </div>
    `;
    document.body.appendChild(recPanel);
    
    // Toggle panel
    recButton.addEventListener('click', () => {
        recPanel.classList.toggle('active');
        if (recPanel.classList.contains('active')) {
            updateRecommendationsPanel();
        }
    });
    
    // Close panel
    recPanel.querySelector('.rec-close').addEventListener('click', () => {
        recPanel.classList.remove('active');
    });
    
    // Clear data button
    recPanel.querySelector('.rec-clear').addEventListener('click', () => {
        userTracker.clear();
        updateRecommendationsPanel();
        showToast('Your browsing data has been cleared');
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!recPanel.contains(e.target) && e.target !== recButton) {
            recPanel.classList.remove('active');
        }
    });
    
    // Show button after some scrolling
    let buttonVisible = false;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300 && !buttonVisible) {
            recButton.classList.add('visible');
            buttonVisible = true;
        }
    });
    
    // Also show after a delay
    setTimeout(() => {
        recButton.classList.add('visible');
    }, 5000);
}

// Update recommendations panel content
function updateRecommendationsPanel() {
    const recList = document.querySelector('.rec-list');
    if (!recList) return;
    
    const recommendations = userTracker.getRecommendations();
    const interests = userTracker.getTopInterests();
    
    if (interests.length > 0) {
        const interestNames = interests
            .map(i => contentCategories[i.category]?.name || i.category)
            .join(', ');
        document.querySelector('.rec-intro').textContent = 
            `Based on your interest in ${interestNames}:`;
    } else {
        document.querySelector('.rec-intro').textContent = 
            'Explore these helpful resources:';
    }
    
    recList.innerHTML = recommendations.map(rec => `
        <a href="${rec.url}" target="_blank" rel="noopener" class="rec-item" data-category="${rec.category}">
            <div class="rec-item-title">${escapeHtml(rec.title)}</div>
            <div class="rec-item-desc">${escapeHtml(rec.description)}</div>
            <div class="rec-item-category">${contentCategories[rec.category]?.name || 'Resource'}</div>
        </a>
    `).join('');
    
    // Track clicks on recommendations
    recList.querySelectorAll('.rec-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            userTracker.trackClick(category, { type: 'recommendation' });
        });
    });
}

// Toast notification
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

// Searchable content index
const searchIndex = [
    // Mental Health
    { id: 'mind', title: 'Mind', category: 'Mental Health', description: 'Leading mental health charity in England and Wales', keywords: 'anxiety depression stress wellbeing counselling therapy', url: 'https://www.mind.org.uk', section: '#mental-health' },
    { id: 'mhf', title: 'Mental Health Foundation', category: 'Mental Health', description: 'UK charity focused on prevention and research', keywords: 'prevention awareness week research', url: 'https://www.mentalhealth.org.uk', section: '#mental-health' },
    { id: 'helpguide', title: 'HelpGuide', category: 'Mental Health', description: 'Evidence-based mental health resources', keywords: 'anxiety depression ptsd meditation self-help', url: 'https://www.helpguide.org', section: '#mental-health' },
    { id: 'beyondblue', title: 'Beyond Blue', category: 'Mental Health', description: 'Australian mental health organisation', keywords: 'anxiety depression suicide prevention', url: 'https://www.beyondblue.org.au', section: '#mental-health' },
    { id: 'rethink', title: 'Rethink Mental Illness', category: 'Mental Health', description: 'Support for those severely affected by mental illness', keywords: 'schizophrenia bipolar severe mental illness', url: 'https://www.rethink.org', section: '#mental-health' },
    { id: 'sane', title: 'SANE', category: 'Mental Health', description: 'Emotional support and combating stigma', keywords: 'saneline emotional support stigma', url: 'https://www.sane.org.uk', section: '#mental-health' },
    
    // Professional Guidance
    { id: 'nice', title: 'NICE Guidelines', category: 'Professional Guidance', description: 'National Institute for Health and Care Excellence', keywords: 'clinical guidelines treatment evidence-based', url: 'https://www.nice.org.uk', section: '#professional-guidance' },
    { id: 'nhs', title: 'NHS Mental Health', category: 'Professional Guidance', description: 'NHS mental health services and information', keywords: 'nhs doctor gp treatment medication', url: 'https://www.nhs.uk/mental-health', section: '#professional-guidance' },
    { id: 'rcpsych', title: 'Royal College of Psychiatrists', category: 'Professional Guidance', description: 'Trusted mental health information', keywords: 'psychiatrist medication treatment professional', url: 'https://www.rcpsych.ac.uk', section: '#professional-guidance' },
    { id: 'cks', title: 'Clinical Knowledge Summaries', category: 'Professional Guidance', description: 'Clinical guidance for professionals', keywords: 'clinical gp professional diagnosis', url: 'https://cks.nice.org.uk', section: '#professional-guidance' },
    
    // Grief & Loss
    { id: 'cruse', title: 'Cruse Bereavement Support', category: 'Grief & Loss', description: 'Free bereavement support', keywords: 'grief bereavement death loss mourning', url: 'https://www.cruse.org.uk', section: '#grief-loss' },
    { id: 'mariecurie', title: 'Marie Curie', category: 'Grief & Loss', description: 'End of life care and support', keywords: 'dying death palliative care hospice', url: 'https://www.mariecurie.org.uk', section: '#grief-loss' },
    { id: 'wyg', title: "What's Your Grief", category: 'Grief & Loss', description: 'Grief education and resources', keywords: 'grief education coping loss', url: 'https://whatsyourgrief.com', section: '#grief-loss' },
    { id: 'samaritans', title: 'Samaritans', category: 'Crisis Support', description: '24/7 listening support', keywords: 'crisis suicide support 116123', url: 'https://www.samaritans.org', section: '#get-help' },
    
    // Degenerative Conditions
    { id: 'alzheimers', title: "Alzheimer's Society", category: 'Degenerative Conditions', description: 'Dementia support and information', keywords: 'alzheimers dementia memory cognitive', url: 'https://www.alzheimers.org.uk', section: '#degenerative' },
    { id: 'parkinsons', title: "Parkinson's UK", category: 'Degenerative Conditions', description: 'Support for Parkinsons', keywords: 'parkinsons tremor movement neurological', url: 'https://www.parkinsons.org.uk', section: '#degenerative' },
    { id: 'mnd', title: 'MND Association', category: 'Degenerative Conditions', description: 'Motor Neurone Disease support', keywords: 'motor neurone disease als lou gehrig', url: 'https://www.mndassociation.org', section: '#degenerative' },
    { id: 'ms', title: 'MS Society', category: 'Degenerative Conditions', description: 'Multiple Sclerosis support', keywords: 'multiple sclerosis ms neurological', url: 'https://www.mssociety.org.uk', section: '#degenerative' },
    
    // Financial Support
    { id: 'mhma', title: 'Mental Health & Money Advice', category: 'Financial Support', description: 'Money and mental health support', keywords: 'money debt financial anxiety', url: 'https://mentalhealthandmoneyadvice.org', section: '#financial-support' },
    { id: 'turn2us', title: 'Turn2us', category: 'Financial Support', description: 'Benefits calculator and grants search', keywords: 'benefits grants calculator welfare', url: 'https://www.turn2us.org.uk', section: '#financial-support' },
    { id: 'citizensadvice', title: 'Citizens Advice', category: 'Financial Support', description: 'Free benefits advice', keywords: 'benefits advice pip esa universal credit', url: 'https://www.citizensadvice.org.uk', section: '#financial-support' },
    { id: 'carersuk', title: 'Carers UK', category: 'Financial Support', description: 'Help for carers', keywords: 'carers allowance caring family support', url: 'https://www.carersuk.org', section: '#financial-support' },
];

function initSearch() {
    const modal = document.getElementById('search-modal');
    const searchToggle = document.querySelector('.search-toggle');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.querySelector('.search-results');
    const overlay = modal?.querySelector('.modal-overlay');
    
    if (!modal || !searchToggle) return;
    
    // Open search
    searchToggle.addEventListener('click', () => openSearchModal());
    
    // Keyboard shortcut (Ctrl/Cmd + K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeSearchModal();
        }
    });
    
    // Close on overlay click
    overlay?.addEventListener('click', closeSearchModal);
    
    // Search input
    searchInput?.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            showSearchPlaceholder();
            return;
        }
        performSearch(query);
    }, 200));
    
    // Search tags
    document.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.search;
            searchInput.value = query;
            performSearch(query.toLowerCase());
        });
    });
    
    function openSearchModal() {
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => searchInput?.focus(), 100);
        document.body.style.overflow = 'hidden';
    }
    
    function closeSearchModal() {
        modal.setAttribute('aria-hidden', 'true');
        searchInput.value = '';
        showSearchPlaceholder();
        document.body.style.overflow = '';
    }
    
    function showSearchPlaceholder() {
        searchResults.innerHTML = `
            <div class="search-placeholder">
                <p>🔍 Start typing to search across all resources</p>
                <div class="search-suggestions">
                    <span class="search-tag" data-search="anxiety">Anxiety</span>
                    <span class="search-tag" data-search="depression">Depression</span>
                    <span class="search-tag" data-search="grief">Grief</span>
                    <span class="search-tag" data-search="benefits">Benefits</span>
                    <span class="search-tag" data-search="dementia">Dementia</span>
                    <span class="search-tag" data-search="carers">Carers</span>
                </div>
            </div>
        `;
        // Rebind tag clicks
        searchResults.querySelectorAll('.search-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.dataset.search;
                searchInput.value = query;
                performSearch(query.toLowerCase());
            });
        });
    }
    
    function performSearch(query) {
        const results = searchIndex.filter(item => {
            const searchText = `${item.title} ${item.description} ${item.keywords} ${item.category}`.toLowerCase();
            return searchText.includes(query);
        });
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <span>🔎</span>
                    <p>No results found for "${escapeHtml(query)}"</p>
                    <p style="font-size: 13px; margin-top: 8px;">Try different keywords or browse sections below</p>
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = results.map(item => `
            <a href="${item.url}" target="_blank" class="search-result-item" data-section="${item.section}">
                <div class="search-result-icon" style="background: var(--background-alt);">
                    ${getCategoryIcon(item.category)}
                </div>
                <div class="search-result-info">
                    <h4>${highlightMatch(item.title, query)}</h4>
                    <p>${highlightMatch(item.description, query)}</p>
                    <span class="search-result-category">${item.category}</span>
                </div>
            </a>
        `).join('');
        
        // Add click handlers
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                closeSearchModal();
                // Track search click
                userTracker?.trackClick('search', { query, title: item.querySelector('h4')?.textContent });
            });
        });
    }
    
    function getCategoryIcon(category) {
        const icons = {
            'Mental Health': '🧠',
            'Professional Guidance': '📋',
            'Grief & Loss': '💜',
            'Crisis Support': '🆘',
            'Degenerative Conditions': '🏥',
            'Financial Support': '💷'
        };
        return icons[category] || '📖';
    }
    
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }
    
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// FEEDBACK BUTTONS (Like/Dislike) - With DynamoDB Backend
// ============================================

// API Configuration - deployed to AWS API Gateway
const API_CONFIG = {
    endpoint: 'https://85otm9zzyj.execute-api.eu-west-2.amazonaws.com',
    visitorId: getOrCreateVisitorId()
};

// Get or create anonymous visitor ID
function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('supportcentre_visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('supportcentre_visitor_id', visitorId);
    }
    return visitorId;
}

// API helper function
async function apiRequest(path, options = {}) {
    try {
        const response = await fetch(`${API_CONFIG.endpoint}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-Visitor-Id': API_CONFIG.visitorId,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showToast('Unable to save feedback. Please try again.');
        return null;
    }
}

// Feedback store - DynamoDB API only
const feedbackStore = {
    cache: {},
    
    // Get feedback from API
    async getFeedback(resourceId) {
        const apiData = await apiRequest(`/feedback/${encodeURIComponent(resourceId)}`);
        if (apiData) {
            this.cache[resourceId] = apiData;
            return apiData;
        }
        return this.cache[resourceId] || { likes: 0, dislikes: 0, userVote: null, commentCount: 0 };
    },
    
    // Sync version for immediate UI updates (uses cache)
    getFeedbackSync(resourceId) {
        return this.cache[resourceId] || { likes: 0, dislikes: 0, userVote: null, commentCount: 0 };
    },
    
    // Submit vote to API
    async setVote(resourceId, vote) {
        const apiData = await apiRequest(`/feedback/${encodeURIComponent(resourceId)}/vote`, {
            method: 'POST',
            body: JSON.stringify({ vote })
        });
        
        if (apiData) {
            this.cache[resourceId] = apiData;
            return apiData;
        }
        return null;
    },
    
    // Add comment via API
    async addComment(resourceId, text) {
        const apiData = await apiRequest(`/comments/${encodeURIComponent(resourceId)}`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
        return apiData;
    },
    
    // Get comments from API
    async getComments(resourceId) {
        const apiData = await apiRequest(`/comments/${encodeURIComponent(resourceId)}`);
        if (apiData && apiData.comments) {
            return apiData.comments;
        }
        return [];
    },
    
    // Load all feedback on page load
    async loadAllFeedback() {
        const apiData = await apiRequest('/feedback');
        if (apiData && apiData.feedback) {
            this.cache = apiData.feedback;
            return apiData.feedback;
        }
        return {};
    }
};

async function initFeedbackButtons() {
    // Load all feedback from API on page load
    await feedbackStore.loadAllFeedback();
    
    // Add feedback buttons to all resource cards that don't have them
    document.querySelectorAll('.resource-card').forEach((card, index) => {
        // Generate ID if not present
        if (!card.dataset.resourceId) {
            const title = card.querySelector('h3')?.textContent || `resource-${index}`;
            card.dataset.resourceId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        
        // Check if feedback buttons already exist
        if (card.querySelector('.feedback-buttons')) {
            updateFeedbackUI(card);
            bindFeedbackEvents(card);
            return;
        }
        
        // Find the button/link container
        const content = card.querySelector('.resource-content');
        const existingBtn = content?.querySelector('.btn');
        
        if (existingBtn && content) {
            // Wrap existing button and add feedback
            const wrapper = document.createElement('div');
            wrapper.className = 'resource-actions';
            wrapper.innerHTML = `
                <div class="feedback-buttons">
                    <button class="feedback-btn like-btn" data-action="like" title="Helpful">
                        <span class="feedback-icon">👍</span>
                        <span class="feedback-count">0</span>
                    </button>
                    <button class="feedback-btn dislike-btn" data-action="dislike" title="Not helpful">
                        <span class="feedback-icon">👎</span>
                        <span class="feedback-count">0</span>
                    </button>
                    <button class="feedback-btn comment-btn" data-action="comment" title="Comments">
                        <span class="feedback-icon">💬</span>
                        <span class="feedback-count">0</span>
                    </button>
                </div>
            `;
            
            // Move existing button into wrapper
            existingBtn.parentNode.insertBefore(wrapper, existingBtn);
            wrapper.insertBefore(existingBtn, wrapper.firstChild);
            
            updateFeedbackUI(card);
            bindFeedbackEvents(card);
        }
    });
}

function updateFeedbackUI(card) {
    const resourceId = card.dataset.resourceId;
    const feedback = feedbackStore.getFeedbackSync(resourceId);
    
    const likeBtn = card.querySelector('.like-btn');
    const dislikeBtn = card.querySelector('.dislike-btn');
    const commentBtn = card.querySelector('.comment-btn');
    
    if (likeBtn) {
        likeBtn.querySelector('.feedback-count').textContent = feedback.likes || 0;
        likeBtn.classList.toggle('active', feedback.userVote === 'like');
    }
    
    if (dislikeBtn) {
        dislikeBtn.querySelector('.feedback-count').textContent = feedback.dislikes || 0;
        dislikeBtn.classList.toggle('active', feedback.userVote === 'dislike');
    }
    
    if (commentBtn) {
        const commentCount = feedback.commentCount || feedback.comments?.length || 0;
        commentBtn.querySelector('.feedback-count').textContent = commentCount;
        commentBtn.classList.toggle('has-comments', commentCount > 0);
    }
}

function bindFeedbackEvents(card) {
    const resourceId = card.dataset.resourceId;
    const resourceTitle = card.querySelector('h3')?.textContent || resourceId;
    
    card.querySelector('.like-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.target.closest('.feedback-btn').disabled = true;
        await feedbackStore.setVote(resourceId, 'like');
        updateFeedbackUI(card);
        e.target.closest('.feedback-btn').disabled = false;
        showToast('Thanks for your feedback!');
    });
    
    card.querySelector('.dislike-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        e.target.closest('.feedback-btn').disabled = true;
        await feedbackStore.setVote(resourceId, 'dislike');
        updateFeedbackUI(card);
        e.target.closest('.feedback-btn').disabled = false;
        showToast('Thanks for your feedback!');
    });
    
    card.querySelector('.comment-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await openCommentsModal(resourceId, resourceTitle);
    });
}

// ============================================
// COMMENTS SYSTEM - With DynamoDB Backend
// ============================================

let currentCommentResource = null;

function initComments() {
    const modal = document.getElementById('comments-modal');
    const overlay = modal?.querySelector('.modal-overlay');
    const closeBtn = modal?.querySelector('.modal-close');
    const form = document.getElementById('comment-form');
    const textarea = document.getElementById('comment-text');
    const charCount = document.getElementById('char-count');
    
    if (!modal) return;
    
    // Close handlers
    overlay?.addEventListener('click', closeCommentsModal);
    closeBtn?.addEventListener('click', closeCommentsModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeCommentsModal();
        }
    });
    
    // Character counter
    textarea?.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });
    
    // Form submit
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = textarea.value.trim();
        
        if (!text || !currentCommentResource) return;
        
        // Disable form during submission
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
        
        await feedbackStore.addComment(currentCommentResource, text);
        textarea.value = '';
        charCount.textContent = '0';
        
        await renderComments(currentCommentResource);
        updateAllFeedbackUI();
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
        showToast('Comment posted anonymously!');
    });
}

async function openCommentsModal(resourceId, title) {
    const modal = document.getElementById('comments-modal');
    const titleEl = document.getElementById('comments-title');
    
    currentCommentResource = resourceId;
    titleEl.textContent = `Feedback: ${title}`;
    
    // Show loading state
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '<div class="no-comments"><p>Loading comments...</p></div>';
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Load comments asynchronously
    await renderComments(resourceId);
}

function closeCommentsModal() {
    const modal = document.getElementById('comments-modal');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentCommentResource = null;
}

async function renderComments(resourceId) {
    const commentsList = document.getElementById('comments-list');
    const comments = await feedbackStore.getComments(resourceId);
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <span>💬</span>
                <p>No comments yet. Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.commentId || comment.id}">
            <p class="comment-text">${escapeHtml(comment.text)}</p>
            <div class="comment-meta">
                <span>${formatTimeAgo(comment.timestamp)}</span>
                <div class="comment-helpful">
                    <button onclick="markHelpful('${comment.commentId || comment.id}')">👍 Helpful</button>
                </div>
            </div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
}

function updateAllFeedbackUI() {
    document.querySelectorAll('.resource-card[data-resource-id]').forEach(updateFeedbackUI);
}

// Make markHelpful global for inline onclick
window.markHelpful = function(commentId) {
    showToast('Marked as helpful!');
};
