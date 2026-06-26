/* 2048 runtime polish: panel locking, log trimming, and keyboard flow. */
(function () {
    'use strict';

    const MAX_LOG_LINES = 32;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function isShown(element) {
        return Boolean(element && !element.classList.contains('hidden') && getComputedStyle(element).display !== 'none');
    }

    function isTextEntry(target) {
        if (!target) return false;
        return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    }

    function trimLog(box) {
        if (!box) return;
        const lines = $$('.console-line', box);
        const extra = lines.length - MAX_LOG_LINES;
        if (extra > 0) {
            lines.slice(0, extra).forEach((line) => line.remove());
        }
        box.scrollTop = box.scrollHeight;
    }

    function syncPanelHeight() {
        const wrapper = $('.zen-wrapper');
        const left = $('.zen-container');
        const drawer = $('#drawer-panel');
        if (!wrapper || !left || !drawer) return;

        if (window.innerWidth < 900) {
            wrapper.style.removeProperty('--game-shell-height');
            drawer.style.removeProperty('height');
            drawer.style.removeProperty('max-height');
            return;
        }

        const leftHeight = Math.ceil(left.getBoundingClientRect().height);
        const maxHeight = Math.max(560, Math.floor(window.innerHeight - 40));
        const lockedHeight = Math.max(560, Math.min(leftHeight, maxHeight));
        const value = lockedHeight + 'px';
        wrapper.style.setProperty('--game-shell-height', value);
        drawer.style.height = value;
        drawer.style.maxHeight = value;
    }

    function schedulePanelSync() {
        window.requestAnimationFrame(syncPanelHeight);
    }

    function decorateDom() {
        $$('button').forEach((button) => {
            if (!button.type) button.type = 'button';
        });

        $$('.header-controls i, .select-arrow, .status-icon').forEach((icon) => {
            icon.setAttribute('aria-hidden', 'true');
        });

        const score = $('#current-score');
        if (score) score.setAttribute('aria-live', 'polite');

        const ledger = $('#synthesis-ledger');
        if (ledger) {
            ledger.tabIndex = 0;
            ledger.setAttribute('aria-live', 'polite');
            ledger.setAttribute('aria-relevant', 'additions');
            trimLog(ledger);
        }

        const drawer = $('#drawer-panel');
        if (drawer) drawer.setAttribute('aria-hidden', drawer.classList.contains('open') ? 'false' : 'true');

        const trigger = $('#btn-achievements-trigger');
        if (trigger && !trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');

        const board = $('#board');
        if (board) {
            board.tabIndex = -1;
            board.setAttribute('role', 'application');
            board.setAttribute('aria-label', '2048 game board. Use arrow keys or swipe to move tiles.');
        }

        ['#game-over-overlay', '#game-win-overlay'].forEach((selector) => {
            const dialog = $(selector);
            if (!dialog) return;
            dialog.setAttribute('role', 'dialog');
            dialog.setAttribute('aria-modal', 'true');
        });
    }

    function patchGameObject() {
        const game = window.game2048;
        if (!game || game.__runtimePolishApplied) return;
        game.__runtimePolishApplied = true;

        if (typeof game.addLog === 'function') {
            const originalAddLog = game.addLog.bind(game);
            game.addLog = function addPolishedLog(text, type) {
                originalAddLog(text, type);
                trimLog(this.ledgerContainer || $('#synthesis-ledger'));
                schedulePanelSync();
            };
        }

        if (typeof game.toggleDrawer === 'function') {
            const originalToggleDrawer = game.toggleDrawer.bind(game);
            game.toggleDrawer = function togglePolishedDrawer(open) {
                originalToggleDrawer(open);
                if (this.drawerTriggerBtn) this.drawerTriggerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (this.drawerPanel) this.drawerPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
                schedulePanelSync();
            };
        }

        if (typeof game.saveGameState === 'function') {
            window.addEventListener('pagehide', () => {
                if (game.moves > 0) game.saveGameState();
            });
        }
    }

    function clickIfAvailable(selector) {
        const element = $(selector);
        if (element && !element.disabled && isShown(element)) {
            element.click();
            return true;
        }
        return false;
    }

    function closeActiveSelect() {
        const activeSelect = $('.custom-select.active');
        if (!activeSelect) return false;
        activeSelect.classList.remove('active');
        const trigger = $('.custom-select-trigger', activeSelect);
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
        }
        return true;
    }

    function handleKeyboard(event) {
        const activeSelect = $('.custom-select.active');

        if (event.key === 'Enter') {
            if (isTextEntry(event.target)) return;

            if (activeSelect) {
                event.preventDefault();
                const option = $('.custom-select-option.selected', activeSelect) || $('.custom-select-option', activeSelect);
                if (option) option.click();
                closeActiveSelect();
                return;
            }

            if (isShown($('#game-over-overlay'))) {
                event.preventDefault();
                clickIfAvailable('#btn-retry');
                return;
            }

            if (isShown($('#game-win-overlay'))) {
                event.preventDefault();
                clickIfAvailable('#btn-keep-going') || clickIfAvailable('#btn-win-restart');
                return;
            }

            const active = document.activeElement;
            if (active && active.matches('.icon-btn, .btn, .theme-toggle-btn, .milestone-card')) {
                event.preventDefault();
                active.click();
            }
        }

        if (event.key === 'Escape') {
            if (closeActiveSelect()) {
                event.preventDefault();
                return;
            }

            const game = window.game2048;
            if (game && game.drawerPanel && game.drawerPanel.classList.contains('open') && typeof game.toggleDrawer === 'function') {
                event.preventDefault();
                game.toggleDrawer(false);
                if (game.drawerTriggerBtn) game.drawerTriggerBtn.focus();
                return;
            }

            if (isShown($('#game-win-overlay'))) {
                event.preventDefault();
                clickIfAvailable('#btn-keep-going');
            }
        }
    }

    function initCustomSelectKeys() {
        $$('.custom-select-trigger').forEach((trigger) => {
            if (trigger.dataset.keyboardReady === 'true') return;
            trigger.dataset.keyboardReady = 'true';
            trigger.tabIndex = 0;
            trigger.setAttribute('role', 'button');
            trigger.setAttribute('aria-haspopup', 'listbox');
            trigger.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    trigger.click();
                    schedulePanelSync();
                }
            });
        });
    }

    function initReducedMotion() {
        document.body.classList.toggle('reduce-motion', reducedMotionQuery.matches);
        const sync = () => document.body.classList.toggle('reduce-motion', reducedMotionQuery.matches);
        if (reducedMotionQuery.addEventListener) {
            reducedMotionQuery.addEventListener('change', sync);
        } else if (reducedMotionQuery.addListener) {
            reducedMotionQuery.addListener(sync);
        }
    }

    function initPanelLock() {
        schedulePanelSync();
        window.addEventListener('resize', schedulePanelSync, { passive: true });
        window.addEventListener('orientationchange', schedulePanelSync, { passive: true });
        const left = $('.zen-container');
        if (window.ResizeObserver && left) {
            new ResizeObserver(schedulePanelSync).observe(left);
        }
    }

    function boot() {
        document.documentElement.dataset.app = '2048';
        initReducedMotion();
        decorateDom();
        initCustomSelectKeys();
        patchGameObject();
        initPanelLock();
        document.addEventListener('keydown', handleKeyboard, true);
        setTimeout(() => {
            patchGameObject();
            decorateDom();
            syncPanelHeight();
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
