/*
 * 2024 runtime optimizations
 * Non-invasive enhancements layered on top of the original static game.
 */
(function () {
    'use strict';

    const APP_NAME = '2024';
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setMeta(name, value, attr = 'name') {
        let meta = document.head.querySelector(`meta[${attr}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', value);
    }

    function syncReducedMotionClass() {
        document.body.classList.toggle('reduce-motion', reducedMotionQuery.matches);
    }

    function syncThemeColor() {
        const computed = getComputedStyle(document.body);
        const accent = computed.getPropertyValue('--accent').trim() || '#a855f7';
        setMeta('theme-color', accent);
    }

    function improveCustomDropdownKeyboard() {
        document.querySelectorAll('.custom-select').forEach((customSelect) => {
            const trigger = customSelect.querySelector('.custom-select-trigger');
            if (!trigger || trigger.dataset.optimized === 'true') return;

            trigger.dataset.optimized = 'true';
            trigger.tabIndex = 0;
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('aria-haspopup', 'listbox');
            trigger.setAttribute('aria-expanded', customSelect.classList.contains('active') ? 'true' : 'false');

            trigger.addEventListener('click', () => {
                window.requestAnimationFrame(() => {
                    trigger.setAttribute('aria-expanded', customSelect.classList.contains('active') ? 'true' : 'false');
                });
            });

            trigger.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    trigger.click();
                    window.requestAnimationFrame(() => {
                        trigger.setAttribute('aria-expanded', customSelect.classList.contains('active') ? 'true' : 'false');
                    });
                }
                if (event.key === 'Escape') {
                    customSelect.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.querySelectorAll('.custom-select-options').forEach((options) => {
            options.setAttribute('role', 'listbox');
        });

        document.querySelectorAll('.custom-select-option').forEach((option) => {
            option.setAttribute('role', 'option');
            option.tabIndex = -1;
        });
    }

    function hardenGameInstance(game) {
        if (!game || game.__runtimeOptimized) return;
        game.__runtimeOptimized = true;

        const originalAddLog = game.addLog.bind(game);
        game.addLog = function addOptimizedLog(text, type = 'info') {
            originalAddLog(text, type);
            if (this.ledgerContainer) {
                this.ledgerContainer.setAttribute('aria-live', 'polite');
                this.ledgerContainer.setAttribute('aria-relevant', 'additions');
            }
        };

        const originalUpdateThemeModeUI = game.updateThemeModeUI.bind(game);
        game.updateThemeModeUI = function updateOptimizedThemeModeUI() {
            originalUpdateThemeModeUI();
            syncThemeColor();
        };

        const originalSetupThemes = game.setupThemes.bind(game);
        game.setupThemes = function setupOptimizedThemes() {
            originalSetupThemes();
            syncThemeColor();
        };

        const originalToggleDrawer = game.toggleDrawer.bind(game);
        game.toggleDrawer = function toggleOptimizedDrawer(open) {
            originalToggleDrawer(open);
            if (this.drawerTriggerBtn) this.drawerTriggerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (this.drawerPanel) this.drawerPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
        };

        window.addEventListener('pagehide', () => {
            if (typeof game.saveGameState === 'function' && game.moves > 0) {
                game.saveGameState();
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;

            if (game.drawerPanel && game.drawerPanel.classList.contains('open')) {
                game.toggleDrawer(false);
            }

            if (game.gameWinOverlay && game.keepPlayingAfterWin) {
                game.gameWinOverlay.classList.add('hidden');
            }
        });
    }

    function optimizeConstellation(network) {
        if (!network || network.__runtimeOptimized) return;
        network.__runtimeOptimized = true;

        const originalAnimate = network.animate.bind(network);
        network.animate = function optimizedAnimate() {
            if (document.hidden || reducedMotionQuery.matches) {
                requestAnimationFrame(() => network.animate());
                return;
            }
            originalAnimate();
        };
    }

    function boot() {
        document.title = APP_NAME;
        document.documentElement.dataset.app = APP_NAME;
        syncReducedMotionClass();
        syncThemeColor();
        improveCustomDropdownKeyboard();
        hardenGameInstance(window.game2048);
        optimizeConstellation(window.bgConstellation);

        setMeta('application-name', APP_NAME);
        setMeta('og:title', APP_NAME, 'property');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', syncReducedMotionClass);
    } else if (reducedMotionQuery.addListener) {
        reducedMotionQuery.addListener(syncReducedMotionClass);
    }
})();
