# 2024 🌌

> **A premium, high-fidelity responsive 2048-style synthesis experience designed with modern aesthetics, interactive feedback, dynamic ambient sound, and a polished 2024 app shell.**
>
> 🌌 **Live Demo:** after the repository is renamed, publish at `https://lunora-gather.github.io/2024/`.

---

## 🎮 Overview

2024 is a responsive browser game inspired by classic 2048 mechanics. It adds a modern visual layer, procedural audio, undo support, multiple board sizes, theme presets, achievements, persistent progress, and an activity ledger.

The current codebase is intentionally simple: no build step, no framework lock-in, and no package manager requirement. You can open it with any static file server.

---

## ✨ Core Highlights

### 1. 🌌 Dynamic visual system
- Canvas constellation background with merge shockwaves.
- Light/dark interface modes.
- Four visual themes: Cyberpunk, Retro Gold, Pastel Dream, and Minimalist.

### 2. 🎹 Procedural audio feedback
- Real-time Web Audio API synthesis.
- Multiple synth presets: Zen Chimes, Cyber Pluck, Retro Synth, and Mech Switch.
- Spatial merge feedback based on board position.

### 3. 🧩 Playability features
- 4×4, 5×5, and 6×6 board sizes.
- Undo history.
- Auto-save and best-score persistence.
- Achievements and activity stream.

### 4. ♿ Optimization pass
- Updated app shell branding to **2024**.
- Added SEO/Open Graph metadata.
- Improved button/select labels, dialogs, and live regions.
- Added early accessibility CSS and reduced-motion handling.
- Added page-hide save protection and drawer accessibility state syncing.

---

## 🖥️ Local Running Guide

This project runs 100% on standard web client technologies with zero build configuration.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lunora-Gather/2024.git
   cd 2024
   ```

2. **Start a local static server:**
   ```bash
   npx -y http-server -p 8080 -c-1
   ```

3. Open `http://localhost:8080` in your browser.

For the current pre-rename repository, use:

```bash
git clone https://github.com/Lunora-Gather/2048-zen-synthesis.git
cd 2048-zen-synthesis
npx -y http-server -p 8080 -c-1
```

---

## 🛠️ Technology Stack

- **Core Logic:** Vanilla JavaScript / ES6 classes
- **Renderer:** HTML5 Canvas background effects
- **Styling:** Modern CSS variables, responsive layout, glassmorphism, hardware-accelerated transitions
- **Audio:** Web Audio API procedural synthesis
- **Deployment:** GitHub Pages static hosting

---

## 📁 Main Files

```text
index.html          App shell, metadata, controls, board markup
style.css           Visual system and responsive layout
optimizations.css   Early accessibility and reduced-motion styles
script.js           Core game logic, audio, persistence, canvas renderer
optimizations.js    Runtime accessibility/performance enhancements
README.md           Project guide
```

---

## 🔧 Repository Rename Note

The intended repository name is **2024**. After renaming the repository in GitHub settings, GitHub Pages should be checked so the published URL points to `/2024/`.

---

> Designed & Developed with 🤍 by **Antigravity**.
