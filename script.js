/**
 * 2048: Zen Synthesis | Procedural Audio Synthesizer
 */
class SoundEffects {
    constructor() {
        this.ctx = null;
        this.muted = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playClick() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.05);

        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playSlide() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playMerge(col = null, size = 4) {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4 major chord for zen fusion
        
        // Calculate spatial stereo pan based on merge column
        let panner = null;
        if (col !== null && ctx.createStereoPanner) {
            panner = ctx.createStereoPanner();
            // Map col from 0..size-1 to a subtle pan range of -0.5..0.5
            const panVal = ((col / (size - 1)) * 2 - 1) * 0.5;
            panner.pan.setValueAtTime(panVal, now);
            panner.connect(ctx.destination);
        }

        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.connect(filter);
            filter.connect(gain);
            
            if (panner) {
                gain.connect(panner);
            } else {
                gain.connect(ctx.destination);
            }

            osc.type = 'triangle';
            osc.frequency.value = freq;

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(250, now + 0.22);

            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.start(now);
            osc.stop(now + 0.22);
        });
    }

    playWin() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, index) => {
            const delay = index * 0.12;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.0, now + delay);
            gain.gain.linearRampToValueAtTime(0.035, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);

            osc.start(now + delay);
            osc.stop(now + delay + 0.35);
        });
    }

    playAchievement() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            const delay = index * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.0, now + delay);
            gain.gain.linearRampToValueAtTime(0.02, now + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

            osc.start(now + delay);
            osc.stop(now + delay + 0.25);
        });
    }

    playGameOver() {
        if (this.muted) return;
        this.init();
        const ctx = this.ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const notes = [196.00, 164.81, 130.81]; // G3, Eb3, C3
        notes.forEach((freq, index) => {
            const delay = index * 0.16;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.setValueAtTime(0.0, now + delay);
            gain.gain.linearRampToValueAtTime(0.035, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

            osc.start(now + delay);
            osc.stop(now + delay + 0.45);
        });
    }
}

// Representing a single Grid Tile element
class Tile {
    constructor(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.id = Tile.nextId++;
        this.element = null;
        this.isNew = true;
        this.isMerged = false;
    }
}
Tile.nextId = 1;

// Core Game controller class
class Game2048 {
    constructor() {
        // Core elements
        this.boardElement = document.getElementById('board');
        this.tilesContainer = document.getElementById('tiles-container');
        this.scoreElement = document.getElementById('current-score');
        this.scoreAddElement = document.getElementById('score-addition-container');
        this.bestScoreElement = document.getElementById('best-score');
        this.movesElement = document.getElementById('stat-moves');
        this.timeElement = document.getElementById('stat-time');
        this.maxTileElement = document.getElementById('stat-max-tile');
        
        // Panels / Consoles
        this.ledgerContainer = document.getElementById('synthesis-ledger');
        this.drawerPanel = document.getElementById('drawer-panel');
        this.drawerCloseBtn = document.getElementById('btn-drawer-close');
        this.drawerTriggerBtn = document.getElementById('btn-achievements-trigger');
        this.drawerBackdrop = document.getElementById('drawer-backdrop');
        
        // Main action buttons
        this.restartBtn = document.getElementById('btn-restart');
        this.undoBtn = document.getElementById('btn-undo');
        this.retryBtn = document.getElementById('btn-retry');
        this.keepGoingBtn = document.getElementById('btn-keep-going');
        this.winRestartBtn = document.getElementById('btn-win-restart');
        
        // Settings Selectors
        this.gridSizeSelect = document.getElementById('grid-size');
        this.themeSelect = document.getElementById('theme-select');
        this.themeToggleBtn = document.getElementById('btn-theme-toggle');
        
        // Overlays
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.gameWinOverlay = document.getElementById('game-win-overlay');

        // Parameters
        this.size = parseInt(this.gridSizeSelect.value) || 4;
        this.theme = this.themeSelect.value || 'cyberpunk';
        this.isDarkMode = false; // Default to Light Mode for premium Zen layout
        
        // Achievement states
        this.unlockedMilestones = {
            first: false,
            tile64: false,
            tile512: false,
            tile2048: false
        };

        // Runtime states
        this.grid = []; 
        this.score = 0;
        this.bestScore = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameEnded = false;
        this.gameWon = false;
        this.keepPlayingAfterWin = false;
        this.isMoving = false;
        
        // History for undo stack
        this.history = [];
        this.maxUndoHistory = 15;

        // Gestures tracking
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Run initialization
        this.sounds = new SoundEffects();
        this.loadSettings();
        this.setupThemes();
        this.initCustomDropdowns();
        this.setupEventListeners();
        this.newGame();
    }

    loadSettings() {
        const savedSize = localStorage.getItem('2048-grid-size');
        if (savedSize) {
            this.size = Math.max(4, parseInt(savedSize));
            this.gridSizeSelect.value = this.size.toString();
        }

        const savedTheme = localStorage.getItem('2048-theme');
        if (savedTheme) {
            this.theme = savedTheme;
            this.themeSelect.value = savedTheme;
        }

        // Load mode preference (defaults to light if not set)
        const savedThemeMode = localStorage.getItem('2048-theme-mode');
        if (savedThemeMode !== null) {
            this.isDarkMode = savedThemeMode === 'dark';
        }
        this.updateThemeModeUI();

        const savedBest = localStorage.getItem(`2048-best-score-${this.size}`);
        this.bestScore = savedBest ? parseInt(savedBest) : 0;
        this.bestScoreElement.textContent = this.bestScore;

        // Milestone achievements load
        const savedMilestones = localStorage.getItem('2048-milestones');
        if (savedMilestones) {
            try {
                this.unlockedMilestones = JSON.parse(savedMilestones);
            } catch (e) {
                console.error("Error parsing milestones", e);
            }
        }
        this.updateMilestonesUI();

        // Sound settings load
        const savedSoundMuted = localStorage.getItem('2048-sound-muted');
        if (savedSoundMuted !== null) {
            this.sounds.muted = savedSoundMuted === 'true';
        } else {
            this.sounds.muted = true; // default to muted
        }
        this.updateSoundUI();
    }

    saveSettings() {
        localStorage.setItem('2048-grid-size', this.size);
        localStorage.setItem('2048-theme', this.theme);
        localStorage.setItem('2048-theme-mode', this.isDarkMode ? 'dark' : 'light');
        localStorage.setItem(`2048-best-score-${this.size}`, this.bestScore);
    }

    initCustomDropdowns() {
        const selectPills = document.querySelectorAll('.select-pill');
        selectPills.forEach(pill => {
            const select = pill.querySelector('select');
            if (!select) return;
            
            // Remove existing custom select if there is one (to allow hot resetting if needed)
            const existingCustom = pill.querySelector('.custom-select');
            if (existingCustom) existingCustom.remove();
            
            const customSelect = document.createElement('div');
            customSelect.className = 'custom-select';
            
            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';
            
            const triggerText = document.createElement('span');
            const selectedOpt = select.options[select.selectedIndex];
            triggerText.textContent = selectedOpt ? selectedOpt.textContent : '';
            
            const arrow = document.createElement('i');
            arrow.className = 'fa-solid fa-chevron-down arrow';
            
            trigger.appendChild(triggerText);
            trigger.appendChild(arrow);
            customSelect.appendChild(trigger);
            
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'custom-select-options';
            
            Array.from(select.options).forEach(opt => {
                const optEl = document.createElement('div');
                optEl.className = 'custom-select-option';
                if (opt.value === select.value) {
                    optEl.classList.add('selected');
                }
                optEl.textContent = opt.textContent;
                optEl.setAttribute('data-value', opt.value);
                
                optEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    optionsContainer.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
                    optEl.classList.add('selected');
                    
                    triggerText.textContent = opt.textContent;
                    
                    select.value = opt.value;
                    const event = new Event('change');
                    select.dispatchEvent(event);
                    
                    customSelect.classList.remove('active');
                    this.sounds.playClick();
                });
                
                optionsContainer.appendChild(optEl);
            });
            
            customSelect.appendChild(optionsContainer);
            pill.appendChild(customSelect);
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.custom-select').forEach(el => {
                    if (el !== customSelect) el.classList.remove('active');
                });
                customSelect.classList.toggle('active');
                this.sounds.playClick();
            });
        });
        
        // Document-level click handler (only bind once if needed)
        if (!window.customSelectClickBound) {
            document.addEventListener('click', () => {
                document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('active'));
            });
            window.customSelectClickBound = true;
        }
    }

    updateSoundUI() {
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            const icon = soundBtn.querySelector('i');
            if (this.sounds.muted) {
                icon.className = 'fa-solid fa-volume-xmark';
                soundBtn.classList.add('muted');
            } else {
                icon.className = 'fa-solid fa-volume-high';
                soundBtn.classList.remove('muted');
            }
        }
    }

    setupThemes() {
        if (this.boardElement.parentNode) {
            this.boardElement.parentNode.className = `board-frame size-${this.size}`;
        }
        this.boardElement.className = `matrix-board size-${this.size} theme-${this.theme}`;
        
        // Dynamic theme synchronization with document body
        document.body.classList.remove('theme-cyberpunk', 'theme-classic', 'theme-pastel', 'theme-monochrome');
        document.body.classList.add(`theme-${this.theme}`);
    }

    updateThemeModeUI() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    toggleDrawer(open) {
        if (open) {
            this.drawerPanel.classList.add('open');
            if (this.drawerBackdrop) this.drawerBackdrop.classList.add('active');
        } else {
            this.drawerPanel.classList.remove('open');
            if (this.drawerBackdrop) this.drawerBackdrop.classList.remove('active');
        }
    }

    setupEventListeners() {
        // Keyboard inputs
        window.addEventListener('keydown', (e) => {
            // Check for U/u to trigger undo
            if (e.key === 'u' || e.key === 'U') {
                if (this.history.length > 0 && !this.isMoving) {
                    e.preventDefault();
                    this.performUndo();
                    this.sounds.playClick();
                }
                return;
            }

            if (this.isMoving || this.gameEnded || (this.gameWon && !this.keepPlayingAfterWin)) return;

            let direction = null;
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'up';
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'right';
                    break;
                default:
                    return; // Ignore other keys
            }

            e.preventDefault();
            this.handleMove(direction);
        });

        // Grid Size Select Control
        this.gridSizeSelect.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.saveSettings();
            this.setupThemes();
            
            // Reload best score
            const savedBest = localStorage.getItem(`2048-best-score-${this.size}`);
            this.bestScore = savedBest ? parseInt(savedBest) : 0;
            this.bestScoreElement.textContent = this.bestScore;

            this.newGame();
            e.target.blur();
        });

        // Theme Style Select Control
        this.themeSelect.addEventListener('change', (e) => {
            this.theme = e.target.value;
            this.setupThemes();
            this.saveSettings();
            this.addLog(`[SYSTEM] Theme matrix shifted to [${this.theme.toUpperCase()}]`, 'info');
            e.target.blur();
        });

        // Theme Mode Toggle Thumb Button (Light / Dark Switch)
        this.themeToggleBtn.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            this.updateThemeModeUI();
            this.saveSettings();
            this.addLog(`[SYSTEM] Interface shifted to [${this.isDarkMode ? 'DARK' : 'LIGHT'}] mode`, 'info');
            this.sounds.playClick();
        });

        // Sound Toggle Button
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.sounds.muted = !this.sounds.muted;
                localStorage.setItem('2048-sound-muted', this.sounds.muted);
                this.updateSoundUI();
                if (!this.sounds.muted) {
                    this.sounds.playMerge();
                    this.addLog('[SYSTEM] Neural audio feedback enabled.', 'success');
                } else {
                    this.addLog('[SYSTEM] Audio feedback silenced.', 'info');
                }
            });
        }

        // Mobile drawer handlers
        this.drawerTriggerBtn.addEventListener('click', () => { this.toggleDrawer(true); this.sounds.playClick(); });
        this.drawerCloseBtn.addEventListener('click', () => { this.toggleDrawer(false); this.sounds.playClick(); });
        if (this.drawerBackdrop) {
            this.drawerBackdrop.addEventListener('click', () => { this.toggleDrawer(false); this.sounds.playClick(); });
        }

        // Restart buttons (force fresh game and clear autosaved states, blurring target to return focus)
        this.restartBtn.addEventListener('click', (e) => {
            if (this.moves > 0 && !this.gameEnded) {
                if (this.restartBtn.classList.contains('confirm-state')) {
                    this.restartBtn.classList.remove('confirm-state');
                    this.restartBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Restart Grid`;
                    this.newGame(true);
                    this.sounds.playClick();
                } else {
                    this.restartBtn.classList.add('confirm-state');
                    this.restartBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Confirm Restart?`;
                    this.sounds.playClick();
                    
                    // Auto-revert after 3 seconds
                    setTimeout(() => {
                        if (this.restartBtn.classList.contains('confirm-state')) {
                            this.restartBtn.classList.remove('confirm-state');
                            this.restartBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Restart Grid`;
                        }
                    }, 3000);
                }
            } else {
                this.newGame(true);
                this.sounds.playClick();
            }
            e.currentTarget.blur();
        });
        this.retryBtn.addEventListener('click', (e) => { this.newGame(true); this.sounds.playClick(); e.currentTarget.blur(); });
        this.winRestartBtn.addEventListener('click', (e) => { this.newGame(true); this.sounds.playClick(); e.currentTarget.blur(); });

        // Keep going button (persists infinity mode play preference immediately, blurring focus)
        this.keepGoingBtn.addEventListener('click', (e) => {
            this.gameWinOverlay.classList.add('hidden');
            this.keepPlayingAfterWin = true;
            this.addLog('[SYSTEM] Zenith threshold extended. Playing infinity mode.', 'info');
            this.saveGameState();
            this.sounds.playClick();
            e.currentTarget.blur();
        });

        // Undo button (blurs focus so arrow keys are not high-jacked)
        this.undoBtn.addEventListener('click', (e) => { this.performUndo(); this.sounds.playClick(); e.currentTarget.blur(); });

        // Touch swiping
        const touchContainer = this.boardElement;
        
        touchContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        touchContainer.addEventListener('touchmove', (e) => {
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        touchContainer.addEventListener('touchend', (e) => {
            if (this.gameEnded || (this.gameWon && !this.keepPlayingAfterWin)) return;

            const dx = e.changedTouches[0].clientX - this.touchStartX;
            const dy = e.changedTouches[0].clientY - this.touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const minSwipe = 35; // Pixels threshold

            if (Math.max(absDx, absDy) > minSwipe) {
                let direction = null;
                if (absDx > absDy) {
                    direction = dx > 0 ? 'right' : 'left';
                } else {
                    direction = dy > 0 ? 'down' : 'up';
                }
                this.handleMove(direction);
            }
            if (e.cancelable) e.preventDefault();
        }, { passive: false });
    }

    newGame(forceFresh = false) {
        if (forceFresh) {
            localStorage.removeItem(`2048-game-state-${this.size}`);
        } else {
            const savedStateStr = localStorage.getItem(`2048-game-state-${this.size}`);
            if (savedStateStr) {
                try {
                    const state = JSON.parse(savedStateStr);
                    if (state && state.grid) {
                        this.restoreGameState(state);
                        return;
                    }
                } catch (e) {
                    console.error("Error loading saved game state", e);
                }
            }
        }

        // Clear runtime state
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.score = 0;
        this.moves = 0;
        this.gameEnded = false;
        this.gameWon = false;
        this.keepPlayingAfterWin = false;
        this.isMoving = false;
        this.history = [];
        
        // Reset Score UI
        this.scoreElement.textContent = '0';
        this.movesElement.textContent = '0';
        this.maxTileElement.textContent = '0';
        this.updateUndoButton();

        // Clear Board DOM
        this.boardElement.innerHTML = '';
        this.tilesContainer.innerHTML = '';
        this.createBoardGridCells();

        // Close overlays
        this.gameOverOverlay.classList.add('hidden');
        this.gameWinOverlay.classList.add('hidden');

        // Reset timer
        this.startTime = new Date();
        this.timeElement.textContent = '00:00';
        clearInterval(this.timerInterval);
        this.timerInterval = null; // Do not start interval ticking until first move

        // Spawn first two tiles
        this.spawnTile();
        this.spawnTile();

        // Log initialization
        this.clearLogs();
        this.addLog(`[SYSTEM] Matrix initialized (${this.size}x${this.size}). Awaiting cycles...`, 'info');
    }

    saveGameState() {
        const state = {
            grid: this.cloneGridState(),
            score: this.score,
            moves: this.moves,
            gameEnded: this.gameEnded,
            gameWon: this.gameWon,
            keepPlayingAfterWin: this.keepPlayingAfterWin,
            elapsed: this.startTime ? (new Date() - this.startTime) : 0,
            history: this.history
        };
        localStorage.setItem(`2048-game-state-${this.size}`, JSON.stringify(state));
    }

    restoreGameState(state) {
        // Restore values
        this.score = state.score;
        this.scoreElement.textContent = this.score;
        
        this.moves = state.moves;
        this.movesElement.textContent = this.moves;
        
        this.gameEnded = state.gameEnded ?? false;
        this.gameWon = state.gameWon ?? false;
        this.keepPlayingAfterWin = state.keepPlayingAfterWin ?? false;
        
        // History restoration
        this.history = state.history ?? [];
        this.updateUndoButton();
        
        // Clear Board DOM
        this.boardElement.innerHTML = '';
        this.tilesContainer.innerHTML = '';
        this.createBoardGridCells();
        
        // Re-construct grid tiles from state clone
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        state.grid.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val !== null) {
                    const restoredTile = new Tile(r, c, val);
                    this.grid[r][c] = restoredTile;
                    this.renderTile(restoredTile);
                }
            });
        });

        this.updateMaxTileUI();
        
        // Sync overlays
        if (this.gameEnded) {
            if (this.gameWon && !this.keepPlayingAfterWin) {
                this.gameWinOverlay.classList.remove('hidden');
            } else {
                this.gameOverOverlay.classList.remove('hidden');
            }
        } else {
            this.gameOverOverlay.classList.add('hidden');
            this.gameWinOverlay.classList.add('hidden');
        }
        
        // Restore timer precisely
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        if (state.elapsed !== undefined) {
            this.startTime = new Date(new Date().getTime() - state.elapsed);
            this.updateTimer();
            if (!this.gameEnded && this.moves > 0) {
                this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            }
        } else {
            this.startTime = new Date();
            this.timeElement.textContent = '00:00';
        }
        
        this.clearLogs();
        this.addLog(`[SYSTEM] Loaded saved session (${this.size}x${this.size})`, 'info');
    }

    createBoardGridCells() {
        // Render background empty grid cells dynamically to match size layout grid
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                this.boardElement.appendChild(cell);
            }
        }
    }

    spawnTile() {
        const empties = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) {
                    empties.push({ r, c });
                }
            }
        }

        if (empties.length > 0) {
            const randomPick = empties[Math.floor(Math.random() * empties.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            const newTile = new Tile(randomPick.r, randomPick.c, value);
            this.grid[randomPick.r][randomPick.c] = newTile;
            this.renderTile(newTile);
            this.updateMaxTileUI();
        }
    }

    renderTile(tile) {
        const element = document.createElement('div');
        element.className = 'tile tile-new';
        element.setAttribute('data-value', tile.value);
        element.id = `tile-${tile.id}`;
        
        // inner box text container
        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        inner.textContent = tile.value;
        element.appendChild(inner);

        this.tilesContainer.appendChild(element);
        tile.element = element;
        this.positionTile(tile);
    }

    positionTile(tile) {
        // Pure CSS-based responsive positioning: 100% robust against resizing, reflows, and layout timing issues
        const gapVar = `var(--grid-gap-${this.size})`;
        const widthFormula = `((var(--board-size) - (var(--board-padding) * 2) - (${gapVar} * ${this.size - 1})) / ${this.size})`;
        const leftCalc = `calc(var(--board-padding) + ${tile.col} * (${widthFormula} + ${gapVar}))`;
        const topCalc = `calc(var(--board-padding) + ${tile.row} * (${widthFormula} + ${gapVar}))`;
        
        tile.element.style.width = `calc(${widthFormula})`;
        tile.element.style.height = `calc(${widthFormula})`;
        tile.element.style.left = leftCalc;
        tile.element.style.top = topCalc;
    }

    spawnMergeParticles(row, col, value) {
        const gapVar = `var(--grid-gap-${this.size})`;
        const widthFormula = `((var(--board-size) - (var(--board-padding) * 2) - (${gapVar} * ${this.size - 1})) / ${this.size})`;
        
        // Find position of cell center
        const leftCalc = `calc(var(--board-padding) + ${col} * (${widthFormula} + ${gapVar}) + ${widthFormula} / 2)`;
        const topCalc = `calc(var(--board-padding) + ${row} * (${widthFormula} + ${gapVar}) + ${widthFormula} / 2)`;
        
        let color = 'var(--accent-color)';
        if (this.theme === 'cyberpunk') {
            const neonColors = {
                2: '#06b6d4', 4: '#3b82f6', 8: '#a855f7', 16: '#ec4899', 
                32: '#f43f5e', 64: '#eab308', 128: '#10b981', 
                256: '#f97316', 512: '#84cc16', 1024: '#ef4444', 2048: '#f472b6'
            };
            color = neonColors[value] || '#f472b6';
        } else if (this.theme === 'classic') {
            color = '#ca8a04';
        } else if (this.theme === 'pastel') {
            const pastelColors = {
                2: '#fecaca', 4: '#ffedd5', 8: '#fef9c3', 16: '#dcfce7',
                32: '#cffafe', 64: '#dbeafe', 128: '#ede9fe', 256: '#fecdd3'
            };
            color = pastelColors[value] || 'var(--accent-color)';
        }
        
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'merge-particle';
            p.style.left = leftCalc;
            p.style.top = topCalc;
            p.style.background = color;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 45; // pixels
            const dx = `${Math.cos(angle) * distance}px`;
            const dy = `${Math.sin(angle) * distance}px`;
            
            p.style.setProperty('--dx', dx);
            p.style.setProperty('--dy', dy);
            
            if (this.theme === 'cyberpunk') {
                p.style.boxShadow = `0 0 8px ${color}`;
            }
            
            this.tilesContainer.appendChild(p);
            
            setTimeout(() => {
                if (p.parentNode) p.parentNode.removeChild(p);
            }, 600);
        }
    }

    spawnMilestoneConfetti(value) {
        const colors = {
            64: ['#f65e3b', '#eab308', '#f43f5e'],
            512: ['#84cc16', '#10b981', '#06b6d4'],
            2048: ['#f472b6', '#a855f7', '#3b82f6', '#ca8a04']
        };
        const activeColors = colors[value] || ['#6366f1', '#ec4899'];
        
        const count = 36;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'merge-particle milestone-confetti';
            p.style.left = `calc(var(--board-size) / 2)`;
            p.style.top = `calc(var(--board-size) / 2)`;
            
            const color = activeColors[Math.floor(Math.random() * activeColors.length)];
            p.style.background = color;
            if (this.theme === 'cyberpunk') {
                p.style.boxShadow = `0 0 10px ${color}`;
            }
            
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
            const distance = 80 + Math.random() * 120; // pixels
            const dx = `${Math.cos(angle) * distance}px`;
            const dy = `${Math.sin(angle) * distance}px`;
            
            p.style.setProperty('--dx', dx);
            p.style.setProperty('--dy', dy);
            
            const size = 6 + Math.random() * 6;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            
            this.tilesContainer.appendChild(p);
            
            setTimeout(() => {
                if (p.parentNode) p.parentNode.removeChild(p);
            }, 800);
        }
    }

    handleMove(direction) {
        if (this.gameEnded || this.isMoving) return;

        // Backup states for potential undo step
        const gridBackup = this.cloneGridState();
        const scoreBackup = this.score;
        const movesBackup = this.moves;
        const gameEndedBackup = this.gameEnded;
        const gameWonBackup = this.gameWon;
        const keepPlayingAfterWinBackup = this.keepPlayingAfterWin;
        const elapsedBackup = this.startTime ? (new Date() - this.startTime) : 0;

        let moved = false;
        let mergeScore = 0;
        let maxMergeCol = null;
        let maxMergeVal = 0;
        const vector = this.getVector(direction);
        const traversals = this.getTraversals(vector);

        // Reset all merged tags before scanning
        this.grid.forEach(row => {
            row.forEach(tile => {
                if (tile) {
                    tile.isMerged = false;
                    tile.isNew = false;
                    if (tile.element) {
                        tile.element.classList.remove('tile-new', 'tile-merged');
                    }
                }
            });
        });

        // Scan rows/cols according to direction vector
        traversals.r.forEach(currR => {
            traversals.c.forEach(currC => {
                const tile = this.grid[currR][currC];
                if (tile) {
                    const furthest = this.findFurthestPosition(currR, currC, vector);
                    const nextCell = furthest.next;
                    
                    let hasMerged = false;
                    // Check if merge is valid
                    if (nextCell.r >= 0 && nextCell.r < this.size && nextCell.c >= 0 && nextCell.c < this.size) {
                        const targetTile = this.grid[nextCell.r][nextCell.c];
                        if (targetTile && targetTile.value === tile.value && !targetTile.isMerged) {
                            // Merge fusion action
                            hasMerged = true;
                            const mergedValue = tile.value * 2;
                            
                            // Delete moving source, update target values
                            targetTile.value = mergedValue;
                            targetTile.isMerged = true;
                            
                            // Update core scores
                            this.score += mergedValue;
                            mergeScore += mergedValue;

                            if (mergedValue > maxMergeVal) {
                                maxMergeVal = mergedValue;
                                maxMergeCol = nextCell.c;
                            }

                            // Handle UI element fusion animation
                            const tileEl = tile.element;
                            tile.row = nextCell.r;
                            tile.col = nextCell.c;
                            this.positionTile(tile);
                            
                            // Animate fusion pop
                            const oldTargetId = `tile-${targetTile.id}`;
                            const oldTargetEl = targetTile.element;
                            
                            setTimeout(() => {
                                if (tileEl && tileEl.parentNode) tileEl.parentNode.removeChild(tileEl);
                                if (oldTargetEl) {
                                    oldTargetEl.setAttribute('data-value', mergedValue);
                                    oldTargetEl.querySelector('.tile-inner').textContent = mergedValue;
                                    oldTargetEl.classList.add('tile-merged');
                                }
                            }, 120);

                            this.grid[currR][currC] = null;
                            moved = true;

                            // Spawn explosion particles
                            this.spawnMergeParticles(nextCell.r, nextCell.c, mergedValue);

                            // Trigger shockwave on background constellation canvas
                            const cellIndex = nextCell.r * this.size + nextCell.c;
                            const cellEl = this.boardElement.children[cellIndex];
                            if (cellEl && window.bgConstellation) {
                                const rect = cellEl.getBoundingClientRect();
                                const centerX = rect.left + rect.width / 2;
                                const centerY = rect.top + rect.height / 2;
                                window.bgConstellation.triggerShockwave(centerX, centerY);
                            }

                            // Achievement validations
                            this.checkAchievements(mergedValue);
                        }
                    }

                    if (!hasMerged) {
                        if (furthest.f.r !== currR || furthest.f.c !== currC) {
                            // Normal slide movement
                            const nextR = furthest.f.r;
                            const nextC = furthest.f.c;
                            
                            this.grid[nextR][nextC] = tile;
                            this.grid[currR][currC] = null;
                            tile.row = nextR;
                            tile.col = nextC;
                            this.positionTile(tile);
                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved) {
            this.isMoving = true;
            
            // Apply 3D Board Tilt to the parent frame so background and tiles tilt in unison
            const boardFrame = this.boardElement.parentNode;
            if (boardFrame) {
                boardFrame.classList.add(`tilt-${direction}`);
                setTimeout(() => {
                    boardFrame.classList.remove(`tilt-${direction}`);
                }, 180);
            }
            
            // Audio feedback with spatial channel panning matching merge column
            if (mergeScore > 0) {
                this.sounds.playMerge(maxMergeCol, this.size);
            } else {
                this.sounds.playSlide();
            }
            
            // Standard delay to align transition sliding animations
            setTimeout(() => {
                this.isMoving = false;
            }, 150);

            if (this.moves === 0) {
                this.startTimer();
                this.addLog('[SYSTEM] Cycle counting start.', 'info');
            }

            // Save step history
            this.history.push({
                grid: gridBackup,
                score: scoreBackup,
                moves: movesBackup,
                gameEnded: gameEndedBackup,
                gameWon: gameWonBackup,
                keepPlayingAfterWin: keepPlayingAfterWinBackup,
                elapsed: elapsedBackup
            });
            if (this.history.length > this.maxUndoHistory) {
                this.history.shift();
            }
            this.updateUndoButton();

            // Progress stats increment
            this.moves++;
            this.movesElement.textContent = this.moves;

            // Spawn next new tile block
            this.spawnTile();

            // Update scores displays
            this.scoreElement.textContent = this.score;
            if (mergeScore > 0) {
                this.triggerScoreAddition(mergeScore);
                this.addLog(`[SYNTHESIS] Fusion trigger. +${mergeScore} SCORE.`, 'score');
            }

            // Highscore break validator
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.bestScoreElement.textContent = this.bestScore;
                localStorage.setItem(`2048-best-score-${this.size}`, this.bestScore);
            }

            // Game End scan check
            if (this.checkGameEnded()) {
                this.endGame(false);
            }
            this.saveGameState();
        } else {
            // Trigger board shake on invalid inputs
            this.boardElement.classList.add('board-shake');
            setTimeout(() => {
                this.boardElement.classList.remove('board-shake');
            }, 200);
        }
    }

    triggerScoreAddition(score) {
        this.scoreAddElement.innerHTML = '';
        const addEl = document.createElement('div');
        addEl.className = 'score-addition';
        addEl.textContent = `+${score}`;
        
        // Random drift direction for juicy neumorphic look
        const scatterX = `${(Math.random() - 0.5) * 36}px`;
        addEl.style.setProperty('--scatter-x', scatterX);
        
        this.scoreAddElement.appendChild(addEl);
    }

    getVector(direction) {
        const map = {
            up: { r: -1, c: 0 },
            down: { r: 1, c: 0 },
            left: { r: 0, c: -1 },
            right: { r: 0, c: 1 }
        };
        return map[direction];
    }

    getTraversals(vector) {
        const r = [];
        const c = [];
        for (let i = 0; i < this.size; i++) {
            r.push(i);
            c.push(i);
        }
        // Scan backwards if moving right or down to prevent double fusion bugs
        if (vector.c === 1) c.reverse();
        if (vector.r === 1) r.reverse();
        return { r, c };
    }

    findFurthestPosition(r, c, vector) {
        let prevR = r;
        let prevC = c;
        let nextR = r + vector.r;
        let nextC = c + vector.c;

        while (nextR >= 0 && nextR < this.size && nextC >= 0 && nextC < this.size && !this.grid[nextR][nextC]) {
            prevR = nextR;
            prevC = nextC;
            nextR += vector.r;
            nextC += vector.c;
        }

        return {
            f: { r: prevR, c: prevC },
            next: { r: nextR, c: nextC }
        };
    }

    checkGameEnded() {
        // Grid vacancy scanner
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) return false;
            }
        }

        // Combine scanners to find valid merge actions left
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c].value;
                const directions = [{r:1,c:0},{r:-1,c:0},{r:0,c:1},{r:0,c:-1}];
                for (let d of directions) {
                    const nr = r + d.r;
                    const nc = c + d.c;
                    if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                        const target = this.grid[nr][nc];
                        if (target && target.value === val) return false;
                    }
                }
            }
        }
        return true;
    }

    checkAchievements(mergedValue) {
        // Validate milestone synthesises
        if (this.moves === 0) return;
        
        if (mergedValue >= 64 && !this.unlockedMilestones.tile64) {
            this.unlockAchievement('tile64', 'Deca Merge');
        }
        if (mergedValue >= 512 && !this.unlockedMilestones.tile512) {
            this.unlockAchievement('tile512', 'Matrix Elite');
        }
        if (mergedValue >= 2048 && !this.unlockedMilestones.tile2048) {
            this.unlockAchievement('tile2048', 'Zen Master');
            if (!this.gameWon) {
                this.endGame(true);
            }
        }
        
        // General synthesis trigger milestone
        if (!this.unlockedMilestones.first) {
            this.unlockAchievement('first', 'First Spark');
        }
    }

    unlockAchievement(key, name) {
        this.unlockedMilestones[key] = true;
        localStorage.setItem('2048-milestones', JSON.stringify(this.unlockedMilestones));
        this.updateMilestonesUI();
        this.addLog(`[SUCCESS] Milestone Unlocked: [${name}]!`, 'success');
        this.sounds.playAchievement();
        
        let val = 0;
        if (key === 'tile64') val = 64;
        if (key === 'tile512') val = 512;
        if (key === 'tile2048') val = 2048;
        if (val > 0) {
            this.spawnMilestoneConfetti(val);
        }
    }

    updateMilestonesUI() {
        const milestoneDomMap = {
            first: document.getElementById('achieve-first'),
            tile64: document.getElementById('achieve-64'),
            tile512: document.getElementById('achieve-512'),
            tile2048: document.getElementById('achieve-2048')
        };

        for (let k in milestoneDomMap) {
            const el = milestoneDomMap[k];
            if (el) {
                if (this.unlockedMilestones[k]) {
                    el.classList.remove('locked');
                    el.classList.add('unlocked');
                    el.querySelector('i').className = k === 'first' ? 'fa-solid fa-square-plus' : (k === 'tile64' ? 'fa-solid fa-heart' : (k === 'tile512' ? 'fa-solid fa-compass' : 'fa-solid fa-crown'));
                } else {
                    el.classList.add('locked');
                    el.classList.remove('unlocked');
                }
            }
        }
    }

    updateMaxTileUI() {
        let maxVal = 0;
        this.grid.forEach(row => {
            row.forEach(tile => {
                if (tile && tile.value > maxVal) maxVal = tile.value;
            });
        });
        this.maxTileElement.textContent = maxVal;
    }

    updateUndoButton() {
        const count = this.history.length;
        this.undoBtn.disabled = count === 0;
        if (count > 0) {
            this.undoBtn.innerHTML = `<i class="fa-solid fa-arrow-rotate-left"></i> Undo Step (${count})`;
        } else {
            this.undoBtn.innerHTML = `<i class="fa-solid fa-arrow-rotate-left"></i> Undo Step`;
        }
    }

    performUndo() {
        if (this.history.length === 0 || this.isMoving) return;
        
        const previousState = this.history.pop();
        
        // Restore values
        this.score = previousState.score;
        this.scoreElement.textContent = this.score;
        
        this.moves = previousState.moves;
        this.movesElement.textContent = this.moves;

        this.gameEnded = previousState.gameEnded ?? false;
        this.gameWon = previousState.gameWon ?? false;
        this.keepPlayingAfterWin = previousState.keepPlayingAfterWin ?? false;
        
        // Restore elapsed time precisely
        if (previousState.elapsed !== undefined && this.startTime) {
            this.startTime = new Date(new Date().getTime() - previousState.elapsed);
            this.updateTimer();
        }
        
        // Clear tiles
        this.tilesContainer.innerHTML = '';
        
        // Re-construct grid tiles from state clone
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        previousState.grid.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val !== null) {
                    const restoredTile = new Tile(r, c, val);
                    this.grid[r][c] = restoredTile;
                    this.renderTile(restoredTile);
                }
            });
        });

        this.updateMaxTileUI();
        this.updateUndoButton();
        
        // Sync timer interval state
        if (!this.gameEnded) {
            this.gameOverOverlay.classList.add('hidden');
            if (!this.timerInterval) {
                this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            }
        }
        if (!this.gameWon || this.keepPlayingAfterWin) {
            this.gameWinOverlay.classList.add('hidden');
        } else {
            this.gameWinOverlay.classList.remove('hidden');
        }
        
        this.addLog('[SYSTEM] Grid state rolled back to previous cycle.', 'info');
        this.saveGameState();
    }

    cloneGridState() {
        return this.grid.map(row => 
            row.map(tile => tile ? tile.value : null)
        );
    }

    endGame(win) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.gameEnded = true;

        if (win) {
            this.gameWon = true;
            this.sounds.playWin();
            this.gameWinOverlay.classList.remove('hidden');
            this.addLog('[SUCCESS] Zenith limit unlocked! Synthesis core complete.', 'success');
        } else {
            this.sounds.playGameOver();
            this.gameOverOverlay.classList.remove('hidden');
            this.addLog('[FAILURE] Matrix capacity reached. Board Jammed.', 'danger');
        }
    }

    startTimer() {
        this.startTime = new Date();
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        if (!this.startTime) return;
        const diffMs = new Date() - this.startTime;
        const diffSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(diffSecs / 60).toString().padStart(2, '0');
        const secs = (diffSecs % 60).toString().padStart(2, '0');
        this.timeElement.textContent = `${mins}:${secs}`;
    }

    /* Logs ledger systems */
    addLog(text, type = 'info') {
        const timeStr = new Date().toTimeString().split(' ')[0];
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = `[${timeStr}]`;
        
        const sysSpan = document.createElement('span');
        sysSpan.className = 'sys';
        
        let label = '[SYSTEM]';
        if (type === 'score') label = '[SYNTH]';
        if (type === 'success') label = '[ACHIEV]';
        if (type === 'danger') label = '[HALT]';
        
        sysSpan.textContent = label;
        
        const contentNode = document.createTextNode(` ${text.replace(/^\[SYSTEM\]\s*|^\[SYNTHESIS\]\s*|^\[SUCCESS\]\s*|^\[FAILURE\]\s*/, '')}`);
        
        line.appendChild(timeSpan);
        line.appendChild(sysSpan);
        line.appendChild(contentNode);
        
        this.ledgerContainer.appendChild(line);
        
        // Enforce maximum size on ledger console box to prevent layout and memory degradation
        while (this.ledgerContainer.children.length > 80) {
            this.ledgerContainer.removeChild(this.ledgerContainer.firstChild);
        }
        
        this.ledgerContainer.scrollTop = this.ledgerContainer.scrollHeight;
    }

    clearLogs() {
        this.ledgerContainer.innerHTML = '';
    }
}

// Background Constellation Particle Engine
class ConstellationNetwork {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.shockwaves = [];
        this.mouse = { x: null, y: null };
        
        // Accessibility (A11y): Honor user preferences for reduced motion
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.reducedMotion) {
            this.canvas.style.display = 'none';
            return;
        }
        
        this.resize();
        this.initParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        // Adjust particle count dynamically based on screen size
        const area = this.width * this.height;
        this.maxParticles = Math.min(120, Math.max(25, Math.floor(area / 15000)));
        
        if (this.particles.length === 0) {
            this.initParticles();
        } else {
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            } else {
                while (this.particles.length < this.maxParticles) {
                    this.particles.push(this.createParticle());
                }
            }
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: 1 + Math.random() * 2,
            baseRadius: 1 + Math.random() * 2
        };
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Touch events for mobile hover repel
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        }, { passive: true });
    }

    triggerShockwave(x, y) {
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.35 || 250,
            speed: 5,
            alpha: 1.0,
            intensity: 10
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Throttled reading of theme colors (once every 30 frames) to prevent layout recalculations
        if (!this.frameCount) this.frameCount = 0;
        this.frameCount++;
        if (this.frameCount % 30 === 0 || !this.accentRgb) {
            let defaultAccent = '168, 85, 247';
            const computedStyle = getComputedStyle(document.body);
            const rgbVal = computedStyle.getPropertyValue('--accent-rgb');
            this.accentRgb = rgbVal ? rgbVal.trim() : defaultAccent;
        }
        const accentRgb = this.accentRgb;

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed;
            sw.alpha = 1 - (sw.radius / sw.maxRadius);
            
            if (sw.radius >= sw.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }
        
        const repelRadius = 130;
        const waveWidth = 50;

        // Update & Draw particles
        this.particles.forEach((p) => {
            // Apply velocity drift
            p.x += p.vx;
            p.y += p.vy;
            
            // Boundary bouncing
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;
            
            // Mouse Repulsion
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < repelRadius) {
                    const force = (repelRadius - dist) / repelRadius;
                    const push = force * 2.2;
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * push;
                    p.y += Math.sin(angle) * push;
                }
            }

            // Shockwave dispersion push
            this.shockwaves.forEach(sw => {
                const dx = p.x - sw.x;
                const dy = p.y - sw.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const diff = Math.abs(dist - sw.radius);
                if (diff < waveWidth) {
                    const force = (1 - diff / waveWidth) * sw.alpha * sw.intensity;
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * force;
                    p.y += Math.sin(angle) * force;
                }
            });

            // Re-constrain back into screen bound gracefully if pushed out
            if (p.x < 0) p.x = 0;
            if (p.x > this.width) p.x = this.width;
            if (p.y < 0) p.y = 0;
            if (p.y > this.height) p.y = this.height;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${accentRgb}, 0.35)`;
            this.ctx.fill();
        });

        // Draw connections (constellation lines)
        const connectionLimit = 115;
        this.ctx.lineWidth = 0.8;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < connectionLimit) {
                    const alpha = (1 - dist / connectionLimit) * 0.12;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(${accentRgb}, ${alpha})`;
                    this.ctx.stroke();
                }
            }
        }

        // Draw shockwave visual glowing front rings
        this.shockwaves.forEach(sw => {
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(${accentRgb}, ${sw.alpha * 0.25})`;
            this.ctx.lineWidth = 2.5 * sw.alpha;
            this.ctx.stroke();
        });
    }
}

// Instantiate game instance and constellation on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    window.bgConstellation = new ConstellationNetwork();
    window.game2048 = new Game2048();
});
