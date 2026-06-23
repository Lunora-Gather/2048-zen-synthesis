/**
 * 2048: Zen Synthesis | Core Game Controller
 */

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
    }

    saveSettings() {
        localStorage.setItem('2048-grid-size', this.size);
        localStorage.setItem('2048-theme', this.theme);
        localStorage.setItem('2048-theme-mode', this.isDarkMode ? 'dark' : 'light');
        localStorage.setItem(`2048-best-score-${this.size}`, this.bestScore);
    }

    setupThemes() {
        if (this.boardElement.parentNode) {
            this.boardElement.parentNode.className = `board-frame size-${this.size}`;
        }
        this.boardElement.className = `matrix-board size-${this.size} theme-${this.theme}`;
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
        });

        // Mobile drawer handlers
        this.drawerTriggerBtn.addEventListener('click', () => this.toggleDrawer(true));
        this.drawerCloseBtn.addEventListener('click', () => this.toggleDrawer(false));
        if (this.drawerBackdrop) {
            this.drawerBackdrop.addEventListener('click', () => this.toggleDrawer(false));
        }

        // Restart buttons
        this.restartBtn.addEventListener('click', () => this.newGame());
        this.retryBtn.addEventListener('click', () => this.newGame());
        this.winRestartBtn.addEventListener('click', () => this.newGame());

        // Keep going button
        this.keepGoingBtn.addEventListener('click', () => {
            this.gameWinOverlay.classList.add('hidden');
            this.keepPlayingAfterWin = true;
            this.addLog('[SYSTEM] Zenith threshold extended. Playing infinity mode.', 'info');
        });

        // Undo button
        this.undoBtn.addEventListener('click', () => this.performUndo());

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

    newGame() {
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
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);

        // Spawn first two tiles
        this.spawnTile();
        this.spawnTile();

        // Log initialization
        this.clearLogs();
        this.addLog(`[SYSTEM] Matrix initialized (${this.size}x${this.size}). Awaiting cycles...`, 'info');
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
        // Match CSS grid padding (dynamic via variable) and gap spacing offsets exactly
        const cellSpacing = this.size === 3 ? 14 : (this.size === 4 ? 12 : (this.size === 5 ? 10 : 8));
        
        // Width of single grid cell: (100% - 2 * var(--board-padding) - (size - 1) * gap) / size
        const widthFormula = `((100% - (var(--board-padding) * 2) - ${(this.size - 1) * cellSpacing}px) / ${this.size})`;
        
        // Positioning: var(--board-padding) + index * (cell_width + gap)
        const leftCalc = `calc(var(--board-padding) + ${tile.col} * (${widthFormula} + ${cellSpacing}px))`;
        const topCalc = `calc(var(--board-padding) + ${tile.row} * (${widthFormula} + ${cellSpacing}px))`;
        
        tile.element.style.width = `calc(${widthFormula})`;
        tile.element.style.height = `calc(${widthFormula})`;
        tile.element.style.left = leftCalc;
        tile.element.style.top = topCalc;
    }

    handleMove(direction) {
        if (this.gameEnded || this.isMoving) return;

        // Backup states for potential undo step
        const gridBackup = this.cloneGridState();
        const scoreBackup = this.score;
        const movesBackup = this.moves;

        let moved = false;
        let mergeScore = 0;
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
                moves: movesBackup
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
        this.undoBtn.disabled = this.history.length === 0;
    }

    performUndo() {
        if (this.history.length === 0 || this.isMoving) return;
        
        const previousState = this.history.pop();
        
        // Restore values
        this.score = previousState.score;
        this.scoreElement.textContent = this.score;
        
        this.moves = previousState.moves;
        this.movesElement.textContent = this.moves;
        
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
        
        // Hide overlays if active
        this.gameEnded = false;
        this.gameOverOverlay.classList.add('hidden');
        
        this.addLog('[SYSTEM] Grid state rolled back to previous cycle.', 'info');
    }

    cloneGridState() {
        return this.grid.map(row => 
            row.map(tile => tile ? tile.value : null)
        );
    }

    endGame(win) {
        clearInterval(this.timerInterval);
        this.gameEnded = true;

        if (win) {
            this.gameWon = true;
            this.gameWinOverlay.classList.remove('hidden');
            this.addLog('[SUCCESS] Zenith limit unlocked! Synthesis core complete.', 'success');
        } else {
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
        this.ledgerContainer.scrollTop = this.ledgerContainer.scrollHeight;
    }

    clearLogs() {
        this.ledgerContainer.innerHTML = '';
    }
}

// Instantiate game instance on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    window.game2048 = new Game2048();
});
