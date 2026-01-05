"use strict";

/**
 * Portfolio Site JavaScript
 * Handles interactive functionality and accessibility enhancements
 */

(function() {

    // DOM Elements
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.menu');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const menuLinks = document.querySelectorAll('.menu-link');
    const filterButtons = document.querySelectorAll('.filter-button');

    /**
     * Initialize all functionality when DOM is ready
     */
    function init() {
        setupBurgerMenu();
        setupPortfolioCards();
        setupNavigation();
        setupKeyboardNavigation();
        setupAccessibility();
        setupFilterButtons();
    }

    /**
     * Setup burger menu functionality
     */
    function setupBurgerMenu() {
        if (!burger || !menu) {
            console.warn('Burger menu elements not found');
            return;
        }

        try {
            burger.addEventListener('click', function() {
                const isOpen = document.body.classList.toggle('open');
                burger.setAttribute('aria-expanded', isOpen);
            });

            // Close menu when clicking on menu links
            menuLinks.forEach(link => {
                link.addEventListener('click', function() {
                    document.body.classList.remove('open');
                    burger.setAttribute('aria-expanded', 'false');
                });
            });

            // Close menu when clicking outside (on body)
            document.addEventListener('click', function(event) {
                if (document.body.classList.contains('open')) {
                    const isClickInsideMenu = menu.contains(event.target);
                    const isClickOnBurger = burger.contains(event.target);
                    
                    if (!isClickInsideMenu && !isClickOnBurger) {
                        document.body.classList.remove('open');
                        burger.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            // Close menu on Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && document.body.classList.contains('open')) {
                    document.body.classList.remove('open');
                    burger.setAttribute('aria-expanded', 'false');
                    burger.focus();
                }
            });
        } catch (error) {
            console.error('Error setting up burger menu:', error);
        }
    }

    /**
     * Setup portfolio card interactions
     */
    function setupPortfolioCards() {
        if (!portfolioCards || portfolioCards.length === 0) {
            console.warn('No portfolio cards found');
            return;
        }

        portfolioCards.forEach((card, index) => {
            if (!card) {
                console.warn(`Portfolio card at index ${index} is null or undefined`);
                return;
            }
            // Ensure tabindex and aria-label are set (may already be in HTML)
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
            if (!card.hasAttribute('aria-label')) {
                card.setAttribute('aria-label', `View project details for ${card.querySelector('.card-title')?.textContent || 'project'}`);
            }

            // Click handler - only trigger if clicking on card itself, not on links
            try {
                card.addEventListener('click', function(event) {
                    // Don't trigger if clicking directly on a link or button
                    if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON' || 
                        event.target.closest('a') || event.target.closest('button')) {
                        return;
                    }
                    handleCardClick(card, index);
                });
            } catch (error) {
                console.error(`Error setting up click handler for card ${index}:`, error);
            }

            // Keyboard handler
            card.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleCardClick(card, index);
                }
            });

            // Focus handler for better accessibility
            card.addEventListener('focus', function() {
                card.classList.add('card-focused');
            });

            card.addEventListener('blur', function() {
                card.classList.remove('card-focused');
            });
        });
    }

    /**
     * Handle portfolio card click
     * @param {HTMLElement} card - The clicked card element
     * @param {number} index - The index of the card
     */
    function handleCardClick(card, index) {
        const cardLink = card.querySelector('.card-learn-more');
        if (cardLink) {
            // Navigate to the learn more link
            const href = cardLink.getAttribute('href');
            if (href && href !== '#') {
                window.location.href = href;
            }
        }
    }

    /**
     * Setup navigation functionality
     */
    function setupNavigation() {
        if (!menuLinks || menuLinks.length === 0) return;

        // Set initial active state based on current page
        setInitialActiveState();

        menuLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                
                // Handle anchor links (same page)
                if (href && href.startsWith('#')) {
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        event.preventDefault();
                        scrollToElement(targetElement);
                        setActiveNavigation(this);
                    }
                }
            });
        });

        // Setup scroll detection for Work section (only on index.html)
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            setupScrollDetection();
        }
    }

    /**
     * Set initial active state based on current page
     */
    function setInitialActiveState() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        menuLinks.forEach(link => {
            link.classList.remove('active');
            const pageType = link.getAttribute('data-page');

            if (currentPath.includes('contact.html')) {
                if (pageType === 'contact') {
                    link.classList.add('active');
                }
            } else if (currentHash === '#portfolio') {
                if (pageType === 'work') {
                    link.classList.add('active');
                }
            } else {
                // Default to home active on index page
                if (pageType === 'home' && (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/'))) {
                    link.classList.add('active');
                }
            }
        });
    }

    /**
     * Set active navigation link
     * @param {HTMLElement} activeLink - The link to set as active
     */
    function setActiveNavigation(activeLink) {
        menuLinks.forEach(link => {
            link.classList.remove('active');
        });
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Setup scroll detection to update active navigation
     */
    function setupScrollDetection() {
        const portfolioSection = document.getElementById('portfolio');
        const heroSection = document.querySelector('.hero-section');
        
        if (!portfolioSection || !heroSection) return;

        function updateActiveOnScroll() {
            const scrollPosition = window.scrollY + 100;
            const portfolioTop = portfolioSection.offsetTop;

            menuLinks.forEach(link => {
                const pageType = link.getAttribute('data-page');
                if (pageType === 'work' && scrollPosition >= portfolioTop) {
                    setActiveNavigation(link);
                } else if (pageType === 'home' && scrollPosition < portfolioTop) {
                    setActiveNavigation(link);
                }
            });
        }

        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateActiveOnScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        updateActiveOnScroll();
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Target element to scroll to
     */
    function scrollToElement(element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Setup keyboard navigation enhancements
     */
    function setupKeyboardNavigation() {
        // Arrow key navigation for portfolio cards (optional enhancement)
        document.addEventListener('keydown', function(event) {
            if (event.target.classList.contains('portfolio-card')) {
                handleCardArrowNavigation(event);
            }
        });
    }

    /**
     * Handle arrow key navigation between cards
     * @param {KeyboardEvent} event - Keyboard event
     */
    function handleCardArrowNavigation(event) {
        const cards = Array.from(portfolioCards);
        const currentIndex = cards.indexOf(event.target);

        if (currentIndex === -1) return;

        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % cards.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            nextIndex = (currentIndex - 1 + cards.length) % cards.length;
        } else {
            return;
        }

        event.preventDefault();
        cards[nextIndex].focus();
    }

    /**
     * Setup accessibility enhancements
     */
    function setupAccessibility() {
        // Ensure skip link exists and works properly
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(event) {
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    event.preventDefault();
                    targetElement.focus();
                    scrollToElement(targetElement);
                }
            });
        }

        // Ensure all interactive elements have proper ARIA labels
        const interactiveElements = document.querySelectorAll('button, a, [tabindex]');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label') && 
                !element.getAttribute('aria-labelledby') && 
                !element.textContent.trim()) {
                element.setAttribute('aria-label', 'Interactive element');
            }
        });

        // Announce dynamic content changes to screen readers (placeholder)
        const announcer = document.createElement('div');
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        announcer.id = 'aria-announcer';
        document.body.appendChild(announcer);
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    function announceToScreenReader(message) {
        const announcer = document.getElementById('aria-announcer');
        if (announcer) {
            announcer.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Setup filter button functionality
     */
    function setupFilterButtons() {
        if (!filterButtons || filterButtons.length === 0) {
            console.warn('No filter buttons found');
            return;
        }

        filterButtons.forEach(button => {
            try {
                button.addEventListener('click', function() {
                    handleFilterClick(this);
                });

                button.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleFilterClick(this);
                    }
                });
            } catch (error) {
                console.error('Error setting up filter button:', error);
            }
        });
    }

    /**
     * Handle filter button click
     * @param {HTMLElement} button - The clicked filter button
     */
    function handleFilterClick(button) {
        const filterValue = button.getAttribute('data-filter');
        
        if (!filterValue) {
            console.warn('Filter button missing data-filter attribute');
            return;
        }

        // Update active state
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        // Filter cards
        filterCards(filterValue);

        // Announce filter change to screen readers
        const filterName = button.textContent.trim();
        announceToScreenReader(`Filtered to show ${filterName} projects`);
    }

    /**
     * Filter portfolio cards based on category
     * @param {string} filterValue - The filter value to apply
     */
    function filterCards(filterValue) {
        if (!portfolioCards || portfolioCards.length === 0) {
            return;
        }

        portfolioCards.forEach(card => {
            if (!card) {
                return;
            }

            const categories = card.getAttribute('data-category');
            
            if (!categories) {
                console.warn('Card missing data-category attribute');
                return;
            }

            const categoryArray = categories.toLowerCase().split(' ');
            
            // Show all cards if filter is "all", otherwise show matching categories
            if (filterValue === 'all' || categoryArray.includes(filterValue.toLowerCase())) {
                card.classList.remove('hidden');
                card.setAttribute('aria-hidden', 'false');
            } else {
                card.classList.add('hidden');
                card.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Export functions for potential external use
    window.portfolioSite = {
        scrollToElement: scrollToElement,
        announceToScreenReader: announceToScreenReader,
        filterCards: filterCards
    };

})();

