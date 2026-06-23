/**
 * 2048: Zen Synthesis | Core Game Controller & Canvas FX
 */

// Particle Burst FX Layer (Disabled)
class ParticleSystem {
    constructor(canvas) {}
    resize() {}
    spawnBurst() {}
    spawnTrail() {}
    startLoop() {}
    update() {}
    draw() {}
}

// Background Constellation FX (Disabled)
class BackgroundConstellation {
    constructor(canvas) {}
    resize() {}
    initParticles() {}
    triggerShockwave() {}
    startLoop() {}
    update() {}
    draw() {}
}

// Warm acoustic chime sound generator (Disabled)
class SoundEngine {
    constructor() {
        this.enabled = false;
    }
    init() {}
    playMove() {}
    playMerge() {}
    playUnlock() {}
    playWin() {}
    playGameOver() {}
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
        // Elements
        this.boardElement = document.getElementById('board');
        this.scoreElement = document.getElementById('current-score');
        this.scoreAddElement = document.getElementById('score-addition-container');
        this.bestScoreElement = document.getElementById('best-score');
        this.movesElement = document.getElementById('stat-moves');
        this.timeElement = document.getElementById('stat-time');
        this.maxTileElement = document.getElementById('stat-max-tile');
        
        // Drawers / Panels
        this.ledgerContainer = document.getElementById('synthesis-ledger');
        this.drawerPanel = document.getElementById('drawer-panel');
        this.drawerCloseBtn = document.getElementById('btn-drawer-close');
        this.drawerTriggerBtn = document.getElementById('btn-achievements-trigger');
        
        // Buttons
        this.restartBtn = document.getElementById('btn-restart');
        this.undoBtn = document.getElementById('btn-undo');
        this.soundBtn = document.getElementById('btn-sound');
        this.retryBtn = document.getElementById('btn-retry');
        this.keepGoingBtn = document.getElementById('btn-keep-going');
        this.winRestartBtn = document.getElementById('btn-win-restart');
        
        // Selectors
        this.gridSizeSelect = document.getElementById('grid-size');
        this.themeSelect = document.getElementById('theme-select');
        this.themeToggleBtn = document.getElementById('btn-theme-toggle');
        
        // Overlays
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.gameWinOverlay = document.getElementById('game-win-overlay');

        // FX Canvas
        this.particles = new ParticleSystem(document.getElementById('particle-canvas'));

        // Background Constellation FX
        this.bgConstellation = new BackgroundConstellation(document.getElementById('bg-canvas'));

        // Sound controller
        this.sound = new SoundEngine();

        // Parameters
        this.size = parseInt(this.gridSizeSelect.value) || 4;
        this.theme = this.themeSelect.value || 'cyberpunk';
        this.isDarkMode = true; // Default to dark mode
        
        // Permanent achievements store (loaded from storage)
        this.unlockedMilestones = {
            first: false,
            tile64: false,
            tile512: false,
            tile2048: false
        };

        // Runtime variables
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
        this.recordBrokenLogged = false;
        
        // Undo stacks
        this.history = [];
        this.maxUndoHistory = 15;

        // Gestures
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Core Init
        this.loadSettings();
        this.setupThemes();
        this.setupEventListeners();
        this.newGame();
    }

    loadSettings() {
        const savedSize = localStorage.getItem('2048-grid-size');
        if (savedSize) {
            this.size = parseInt(savedSize);
            this.gridSizeSelect.value = savedSize;
        }

        const savedTheme = localStorage.getItem('2048-theme');
        if (savedTheme) {
            this.theme = savedTheme;
            this.themeSelect.value = savedTheme;
        }

        // Load Dark/Light state
        const savedThemeMode = localStorage.getItem('2048-theme-mode');
        if (savedThemeMode !== null) {
            this.isDarkMode = savedThemeMode === 'dark';
        }
        this.updateThemeModeUI();

        const savedBest = localStorage.getItem(`2048-best-score-${this.size}`);
        this.bestScore = savedBest ? parseInt(savedBest) : 0;
        this.bestScoreElement.textContent = this.bestScore;

        const savedSound = localStorage.getItem('2048-sound-enabled');
        if (savedSound !== null) {
            this.sound.enabled = savedSound === 'true';
            this.updateSoundButtonUI();
        }

        // Achievements load
        const savedMilestones = localStorage.getItem('2048-milestones');
        if (savedMilestones) {
            try {
                this.unlockedMilestones = JSON.parse(savedMilestones);
            } catch (e) {
                console.error("Error parsing milestones", e);
            }
        }
        this.updateMilestonesUI();
    }

    saveSettings() {
        localStorage.setItem('2048-grid-size', this.size);
        localStorage.setItem('2048-theme', this.theme);
        localStorage.setItem('2048-theme-mode', this.isDarkMode ? 'dark' : 'light');
        localStorage.setItem(`2048-best-score-${this.size}`, this.bestScore);
        localStorage.setItem('2048-sound-enabled', this.sound.enabled);
    }

    setupThemes() {
        // Core grid styles (themes Cyberpunk, Retro Gold etc.)
        if (this.boardElement.parentNode) {
            this.boardElement.parentNode.className = `board-frame size-${this.size}`;
        }
        this.boardElement.className = `matrix-board theme-${this.theme}`;
        if (this.particles) {
            this.particles.resize();
        }
    }

    updateThemeModeUI() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    updateSoundButtonUI() {
        const icon = this.soundBtn.querySelector('i');
        if (this.sound.enabled) {
            icon.className = 'fa-solid fa-volume-high';
            this.soundBtn.classList.remove('disabled');
        } else {
            icon.className = 'fa-solid fa-volume-xmark';
            this.soundBtn.classList.add('disabled');
        }
    }

    toggleDrawer(open) {
        let backdrop = document.querySelector('.drawer-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'drawer-backdrop';
            document.body.appendChild(backdrop);
            backdrop.addEventListener('click', () => this.toggleDrawer(false));
        }
        
        if (open) {
            this.drawerPanel.classList.add('open');
            backdrop.classList.add('active');
        } else {
            this.drawerPanel.classList.remove('open');
            backdrop.classList.remove('active');
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Restart buttons
        this.restartBtn.addEventListener('click', () => {
            this.sound.init();
            this.newGame();
        });
        this.retryBtn.addEventListener('click', () => this.newGame());
        this.winRestartBtn.addEventListener('click', () => this.newGame());

        // Undo
        this.undoBtn.addEventListener('click', () => this.undo());

        // Drawer
        this.drawerTriggerBtn.addEventListener('click', () => this.toggleDrawer(true));
        this.drawerCloseBtn.addEventListener('click', () => this.toggleDrawer(false));

        // Sound
        this.soundBtn.addEventListener('click', () => {
            this.sound.enabled = !this.sound.enabled;
            this.sound.init();
            this.updateSoundButtonUI();
            this.saveSettings();
            this.addLog(`[SYSTEM] Haptic Audio: ${this.sound.enabled ? 'ONLINE' : 'OFFLINE'}`, 'info');
        });

        // Theme Toggle Switch Track
        this.themeToggleBtn.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            this.sound.init();
            this.updateThemeModeUI();
            this.saveSettings();
            this.addLog(`[SYSTEM] Interface set to [${this.isDarkMode ? 'DARK' : 'LIGHT'} MODE]`, 'info');
        });

        this.keepGoingBtn.addEventListener('click', () => {
            this.gameWinOverlay.classList.remove('visible');
            setTimeout(() => this.gameWinOverlay.classList.add('hidden'), 300);
            this.keepPlayingAfterWin = true;
            this.addLog('[SYSTEM] Limit override accepted. Resuming runs.', 'info');
            this.startTimer();
        });

        this.gridSizeSelect.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.saveSettings();
            
            const savedBest = localStorage.getItem(`2048-best-score-${this.size}`);
            this.bestScore = savedBest ? parseInt(savedBest) : 0;
            this.bestScoreElement.textContent = this.bestScore;
            
            this.newGame();
            e.target.blur(); // Release focus to restore keyboard play immediately
        });

        this.themeSelect.addEventListener('change', (e) => {
            this.theme = e.target.value;
            this.setupThemes();
            this.saveSettings();
            this.addLog(`[SYSTEM] Theme matrix shifted to [${this.theme.toUpperCase()}]`, 'info');
            e.target.blur(); // Release focus to restore keyboard play immediately
        });



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

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            const minSwipe = 35;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > minSwipe) {
                    if (dx > 0) this.move('right');
                    else this.move('left');
                }
            } else {
                if (Math.abs(dy) > minSwipe) {
                    if (dy > 0) this.move('down');
                    else this.move('up');
                }
            }
        }, { passive: true });
    }

    handleKeyDown(e) {
        if (this.gameEnded || (this.gameWon && !this.keepPlayingAfterWin)) return;

        // Block moves if user is focused on select options
        if (document.activeElement && ["SELECT", "INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            return;
        }

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
            e.preventDefault();
        }

        switch (e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.move('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.move('right');
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.move('up');
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.move('down');
                break;
        }
    }

    newGame() {
        this.stopTimer();
        this.startTime = null;
        this.timeElement.textContent = "00:00";

        this.score = 0;
        this.moves = 0;
        this.gameEnded = false;
        this.gameWon = false;
        this.keepPlayingAfterWin = false;
        this.recordBrokenLogged = false;
        this.scoreElement.textContent = "0";
        this.movesElement.textContent = "0";
        if (this.bestScoreElement && this.bestScoreElement.parentNode) {
            this.bestScoreElement.parentNode.classList.remove('record-flash');
        }
        this.maxTileElement.textContent = "0";
        this.history = [];
        this.updateUndoButton();

        this.gameOverOverlay.classList.remove('visible');
        this.gameOverOverlay.classList.add('hidden');
        this.gameWinOverlay.classList.remove('visible');
        this.gameWinOverlay.classList.add('hidden');

        // Clear console box logs
        this.ledgerContainer.innerHTML = '';
        this.addLog(`[SYSTEM] Matrix initialized (${this.size}x${this.size}). Awaiting cycles...`, 'info');

        // Setup Board Frame sizing and theme classes
        if (this.boardElement.parentNode) {
            this.boardElement.parentNode.className = `board-frame size-${this.size}`;
            
            // Remove old container if it exists from previous run
            const oldContainer = this.boardElement.parentNode.querySelector('.tile-container');
            if (oldContainer) {
                oldContainer.parentNode.removeChild(oldContainer);
            }
        }
        this.boardElement.className = `matrix-board theme-${this.theme}`;
        this.boardElement.innerHTML = '';
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                this.boardElement.appendChild(cell);
            }
        }

        const tileContainer = document.createElement('div');
        tileContainer.className = 'tile-container';
        if (this.boardElement.parentNode) {
            this.boardElement.parentNode.appendChild(tileContainer);
        } else {
            this.boardElement.appendChild(tileContainer);
        }
        this.tileContainerElement = tileContainer;

        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));

        // Add first components
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderTiles();
        this.updateMaxTile();
        this.updateMilestonesUI();
        
        if (this.particles) {
            this.particles.resize();
        }
    }

    startTimer() {
        if (this.timerInterval) return;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            this.timeElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const index = Math.floor(Math.random() * emptyCells.length);
            const { r, c } = emptyCells[index];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[r][c] = new Tile(r, c, value);
        }
    }

    // --- SYSTEMS CONSOLE LOGS ---
    addLog(text, type = 'info') {
        const row = document.createElement('div');
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        let formattedText = text;
        // Format bracketed status prefixes with rich spans for premium high-fidelity output
        formattedText = formattedText.replace(/(\[SYSTEM\])/g, '<span class="log-tag-system">$1</span>');
        formattedText = formattedText.replace(/(\[WARNING\])/g, '<span class="log-tag-warning">$1</span>');
        formattedText = formattedText.replace(/(Fused elements:)/g, '<span class="log-tag-fuse">$1</span>');
        formattedText = formattedText.replace(/(🎖️ Milestones unlocked:)/g, '<span class="log-tag-milestone">$1</span>');
        
        row.innerHTML = `<span class="log-time">[${timeStr}]</span> ${formattedText}`;
        row.className = 'console-line';
        if (type === 'info') row.classList.add('info-log');
        if (type === 'merge') row.classList.add('merge-log');
        if (type === 'unlock') row.classList.add('unlock-log');

        this.ledgerContainer.appendChild(row);

        if (this.ledgerContainer.children.length > 40) {
            this.ledgerContainer.removeChild(this.ledgerContainer.firstChild);
        }

        this.ledgerContainer.scrollTop = this.ledgerContainer.scrollHeight;
    }

    // --- MILESTONES SYSTEM ---
    updateMilestonesUI() {
        const milestones = [
            { key: 'first', el: document.getElementById('achieve-first') },
            { key: 'tile64', el: document.getElementById('achieve-64') },
            { key: 'tile512', el: document.getElementById('achieve-512') },
            { key: 'tile2048', el: document.getElementById('achieve-2048') }
        ];

        milestones.forEach(m => {
            if (m.el) {
                if (this.unlockedMilestones[m.key]) {
                    m.el.className = 'milestone-card unlocked';
                } else {
                    m.el.className = 'milestone-card locked';
                }
            }
        });
    }

    unlockMilestone(key, name) {
        if (this.unlockedMilestones[key]) return;
        
        this.unlockedMilestones[key] = true;
        localStorage.setItem('2048-milestones', JSON.stringify(this.unlockedMilestones));
        
        this.updateMilestonesUI();
        this.sound.playUnlock();
        this.addLog(`🎖️ Milestones unlocked: "${name}"`, 'unlock');
    }

    checkAchievements(maxVal) {
        if (maxVal >= 64 && !this.unlockedMilestones.tile64) {
            this.unlockMilestone('tile64', 'Deca Merge');
        }
        if (maxVal >= 512 && !this.unlockedMilestones.tile512) {
            this.unlockMilestone('tile512', 'Matrix Elite');
        }
        if (maxVal >= 2048 && !this.unlockedMilestones.tile2048) {
            this.unlockMilestone('tile2048', 'Zen Master');
        }
    }

    move(direction) {
        if (this.gameEnded || (this.gameWon && !this.keepPlayingAfterWin)) return;
        if (this.isMoving) return;

        let vector = { x: 0, y: 0 };
        switch (direction) {
            case 'left':  vector.x = -1; break;
            case 'right': vector.x = 1;  break;
            case 'up':    vector.y = -1; break;
            case 'down':  vector.y = 1;  break;
        }

        const rowTraversal = [];
        const colTraversal = [];
        for (let i = 0; i < this.size; i++) {
            rowTraversal.push(i);
            colTraversal.push(i);
        }

        if (vector.x === 1) colTraversal.reverse();
        if (vector.y === 1) rowTraversal.reverse();

        const gridBackup = this.cloneGridState();
        const scoreBackup = this.score;
        const movesBackup = this.moves;

        let moved = false;
        let earnedScore = 0;
        const tilesToRemove = [];
        const mergedCells = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
        const mergesListThisTurn = [];

        rowTraversal.forEach(r => {
            colTraversal.forEach(c => {
                const tile = this.grid[r][c];
                if (tile) {
                    let currR = r;
                    let currC = c;
                    
                    while (true) {
                        const nextR = currR + vector.y;
                        const nextC = currC + vector.x;
                        
                        if (nextR < 0 || nextR >= this.size || nextC < 0 || nextC >= this.size) break;
                        
                        const nextTile = this.grid[nextR][nextC];
                        if (nextTile) {
                            if (nextTile.value === tile.value && !mergedCells[nextR][nextC]) {
                                // Merge
                                const oldVal = tile.value;
                                const newVal = oldVal * 2;
                                
                                tile.isNew = false;
                                tile.isMerged = true;
                                tile.row = nextR;
                                tile.col = nextC;
                                
                                tilesToRemove.push(tile);
                                
                                const merged = new Tile(nextR, nextC, newVal);
                                merged.isNew = false;
                                merged.isMerged = true;
                                
                                this.grid[nextR][nextC] = merged;
                                this.grid[currR][currC] = null;
                                
                                earnedScore += newVal;
                                mergedCells[nextR][nextC] = true;
                                moved = true;
                                
                                mergesListThisTurn.push(`${oldVal}+${oldVal} ➔ ${newVal}`);
                            }
                            break;
                        } else {
                            // Slide through empty space
                            this.grid[nextR][nextC] = tile;
                            this.grid[currR][currC] = null;
                            tile.row = nextR;
                            tile.col = nextC;
                            tile.isNew = false;
                            currR = nextR;
                            currC = nextC;
                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved) {
            this.isMoving = true;
            
            // Remove tilt class additions for flat board layout
            setTimeout(() => {
                this.isMoving = false;
            }, 150);

            if (this.moves === 0) {
                this.startTimer();
                this.addLog('[SYSTEM] Cycle counting start.', 'info');
            }

            this.history.push({
                grid: gridBackup,
                score: scoreBackup,
                moves: movesBackup
            });
            if (this.history.length > this.maxUndoHistory) {
                this.history.shift();
            }
            this.updateUndoButton();

            this.moves++;
            this.movesElement.textContent = this.moves;

            if (earnedScore > 0) {
                this.score += earnedScore;
                this.scoreElement.textContent = this.score;

                if (this.score > this.bestScore) {
                    const originalBest = this.bestScore;
                    this.bestScore = this.score;
                    this.bestScoreElement.textContent = this.bestScore;
                    localStorage.setItem(`2048-best-score-${this.size}`, this.bestScore);

                    // 最高分超越庆祝
                    if (this.bestScoreElement.parentNode) {
                        this.bestScoreElement.parentNode.classList.add('record-flash');
                    }
                    if (originalBest > 0 && !this.recordBrokenLogged) {
                        this.recordBrokenLogged = true;
                        this.addLog('🎖️ NEW RECORD: Neural performance exceeds historical threshold!', 'unlock');
                        // 生成金色爆破粒子
                        setTimeout(() => {
                            if (this.bestScoreElement && this.bestScoreElement.parentNode) {
                                const bestCardRect = this.bestScoreElement.parentNode.getBoundingClientRect();
                                const boardRect = this.boardElement.getBoundingClientRect();
                                const bx = bestCardRect.left - boardRect.left + bestCardRect.width / 2;
                                const by = bestCardRect.top - boardRect.top + bestCardRect.height / 2;
                                this.particles.spawnBurst(bx, by, '#f59e0b', 15);
                            }
                        }, 100);
                    }
                }

                this.showScoreAddition(earnedScore);
                this.sound.playMerge();
                
                // First spark milestone
                if (!this.unlockedMilestones.first) {
                    this.unlockMilestone('first', 'First Spark');
                }

                mergesListThisTurn.forEach(logText => {
                    this.addLog(`Fused elements: ${logText} (+${logText.split('➔')[1].trim()})`, 'merge');
                });
            } else {
                this.sound.playMove();
            }

            this.addRandomTile();
            this.renderTiles(tilesToRemove);
            
            const maxVal = this.updateMaxTile();
            this.checkAchievements(maxVal);
            
            this.checkGameStatus();
        }
    }

    cloneGridState() {
        const state = [];
        for (let r = 0; r < this.size; r++) {
            state.push([]);
            for (let c = 0; c < this.size; c++) {
                const tile = this.grid[r][c];
                if (tile) {
                    const cloned = new Tile(tile.row, tile.col, tile.value);
                    cloned.id = tile.id;
                    cloned.isNew = tile.isNew;
                    cloned.isMerged = tile.isMerged;
                    state[r].push(cloned);
                } else {
                    state[r].push(null);
                }
            }
        }
        return state;
    }

    undo() {
        if (this.history.length === 0 || this.gameEnded) return;

        const previousState = this.history.pop();
        this.score = previousState.score;
        this.moves = previousState.moves;
        
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.tileContainerElement.innerHTML = '';

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const tileData = previousState.grid[r][c];
                if (tileData) {
                    const tile = new Tile(tileData.row, tileData.col, tileData.value);
                    tile.id = tileData.id;
                    tile.isNew = false;
                    this.grid[r][c] = tile;
                }
            }
        }

        this.renderTiles();
        
        this.scoreElement.textContent = this.score;
        this.movesElement.textContent = this.moves;
        this.updateMaxTile();
        this.updateUndoButton();
        this.sound.playMove();

        // 撤销微动抖动特效
        this.boardElement.classList.add('board-shake');
        setTimeout(() => {
            this.boardElement.classList.remove('board-shake');
        }, 200);

        this.gameOverOverlay.classList.remove('visible');
        this.gameOverOverlay.classList.add('hidden');
        this.gameEnded = false;
        
        this.addLog(`[SYSTEM] Temporal rollback accepted. Cycle set to ${this.moves}.`, 'info');
    }

    updateUndoButton() {
        this.undoBtn.disabled = (this.history.length === 0);
    }

    showScoreAddition(score) {
        if (!this.scoreAddElement) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'score-addition-bubble';
        bubble.textContent = `+${score}`;
        
        // Randomize horizontal drift slightly
        const randomX = Math.floor(Math.random() * 32) - 16; // -16px to +16px
        bubble.style.setProperty('--scatter-x', `${randomX}px`);
        
        this.scoreAddElement.appendChild(bubble);
        
        // Auto remove bubble once animation finishes (800ms)
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 800);
    }

    updateMaxTile() {
        let max = 0;
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] && this.grid[r][c].value > max) {
                    max = this.grid[r][c].value;
                }
            }
        }
        this.maxTileElement.textContent = max;

        // 根据最大Tile数值动态渲染全网页环境发光色
        let rgbStr = '99, 102, 241';
        if (max >= 128 && max < 512) {
            rgbStr = '16, 185, 129';
        } else if (max >= 512 && max < 1024) {
            rgbStr = '245, 158, 11';
        } else if (max >= 1024 && max < 2048) {
            rgbStr = '168, 85, 247';
        } else if (max >= 2048) {
            rgbStr = '6, 182, 212';
        }
        document.documentElement.style.setProperty('--ambient-rgb', rgbStr);

        return max;
    }

    renderTiles(tilesToRemove = []) {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const tile = this.grid[r][c];
                if (tile) {
                    if (!tile.element) {
                        const el = document.createElement('div');
                        el.className = 'tile';
                        el.setAttribute('data-value', tile.value);
                        
                        if (tile.value > 2048) {
                            el.classList.add('tile-super');
                        }

                        const inner = document.createElement('div');
                        inner.className = 'tile-inner';
                        inner.textContent = tile.value;
                        el.appendChild(inner);

                        tile.element = el;
                        
                        if (tile.isNew) {
                            el.classList.add('tile-new');
                        } else if (tile.isMerged) {
                            el.classList.add('tile-merged');
                        }

                        this.tileContainerElement.appendChild(el);
                    } else {
                        tile.element.classList.remove('tile-new');
                        tile.element.classList.remove('tile-merged');
                        
                        if (tile.isMerged) {
                            tile.element.classList.add('tile-merged');
                            tile.element.setAttribute('data-value', tile.value);
                            tile.element.querySelector('.tile-inner').textContent = tile.value;
                            if (tile.value > 2048) {
                                tile.element.classList.add('tile-super');
                            }
                        }
                    }

                    tile.element.style.setProperty('--row', tile.row);
                    tile.element.style.setProperty('--col', tile.col);
                    
                    if (tile.isMerged && tile.element) {
                        this.triggerExplosiveFX(tile);
                    }

                    tile.isNew = false;
                    tile.isMerged = false;
                }
            }
        }

        tilesToRemove.forEach(tile => {
            if (tile.element) {
                tile.element.classList.remove('tile-new', 'tile-merged');
                tile.element.style.setProperty('--row', tile.row);
                tile.element.style.setProperty('--col', tile.col);
                
                const el = tile.element;
                setTimeout(() => {
                    if (el && el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, 150);
            }
        });
    }

    triggerExplosiveFX(tile) {
        setTimeout(() => {
            if (!tile.element || !this.particles) return;
            
            const boardRect = this.boardElement.getBoundingClientRect();
            const tileRect = tile.element.getBoundingClientRect();
            
            const x = tileRect.left - boardRect.left + tileRect.width / 2;
            const y = tileRect.top - boardRect.top + tileRect.height / 2;
            
            const tileInner = tile.element.querySelector('.tile-inner');
            const style = window.getComputedStyle(tileInner || tile.element);
            
            const color = style.backgroundImage !== 'none' 
                ? style.backgroundImage 
                : style.backgroundColor;
            
            this.particles.spawnBurst(x, y, color, 18);

            // 同时在背景神经网络上产生以合并点为圆心的引力脉冲冲击波
            if (this.bgConstellation) {
                const bx = tileRect.left + tileRect.width / 2;
                const by = tileRect.top + tileRect.height / 2;
                this.bgConstellation.triggerShockwave(bx, by);
            }
        }, 60);
    }

    checkGameStatus() {
        if (!this.gameWon && !this.keepPlayingAfterWin) {
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    if (this.grid[r][c] && this.grid[r][c].value === 2048) {
                        this.gameWon = true;
                        this.stopTimer();
                        this.sound.playWin();
                        this.triggerWinCelebration();
                        
                        this.addLog('🏆 STAGE CLEAR: Zen Core 2048 Synthesized!', 'unlock');
                        
                        this.gameWinOverlay.classList.remove('hidden');
                        void this.gameWinOverlay.offsetWidth;
                        this.gameWinOverlay.classList.add('visible');
                        return;
                    }
                }
            }
        }

        let movesAvailable = false;
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) {
                    movesAvailable = true;
                    break;
                }
                
                const val = this.grid[r][c].value;
                if (c + 1 < this.size && this.grid[r][c + 1] && this.grid[r][c + 1].value === val) {
                    movesAvailable = true;
                    break;
                }
                if (r + 1 < this.size && this.grid[r + 1][c] && this.grid[r + 1][c].value === val) {
                    movesAvailable = true;
                    break;
                }
            }
            if (movesAvailable) break;
        }

        if (!movesAvailable) {
            this.gameEnded = true;
            this.stopTimer();
            this.sound.playGameOver();
            this.addLog('[WARNING] Board Grid jammed! Operational run aborted.', 'unlock');
            
            this.gameOverOverlay.classList.remove('visible');
            this.gameOverOverlay.classList.add('hidden');
            this.gameOverOverlay.classList.remove('hidden');
            void this.gameOverOverlay.offsetWidth;
            this.gameOverOverlay.classList.add('visible');
        }
    }

    triggerWinCelebration() {
        if (!this.particles) return;
        let count = 0;
        const interval = setInterval(() => {
            if (count > 25 || this.gameEnded) {
                clearInterval(interval);
                return;
            }
            const rx = Math.random() * this.particles.width;
            const ry = Math.random() * this.particles.height;
            const colors = ['#6366f1', '#06b6d4', '#d946ef', '#10b981', '#f59e0b', '#fb7185'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.spawnBurst(rx, ry, color, 20);
            count++;
        }, 120);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
