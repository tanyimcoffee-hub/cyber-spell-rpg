# ⚡ CYBER-SPELL: Dark Magic × Sci-Fi Typing Battle RPG

> *"Every keystroke is a spell. The better you type, the stronger you become."*

A full-fledged real-time multiplayer typing battle RPG built with React + Vite, featuring Web Audio synthesis, cyber-arcana visual effects, adaptive keyboard neural diagnostics, and RPG progression.

---

## 🌟 Key Features

1. **Active Typing Combat:**
   - Real-time word casting: Typing letters unleashes magic beams; complete words deal massive burst damage to enemies.
   - Combo multiplier scaling: 5x, 10x, 20x combo attacks with audio synthesis.
   - Anti-cheat protections: Blocks copy/pasting.

2. **5 Distinct Cyber Classes:**
   - **Technomancer:** High combo damage scaling.
   - **Cyber Knight:** Defense against typing mistakes (loses -2 combo instead of full reset).
   - **Void Hunter:** Critical hit bonus on >95% accuracy.
   - **Astral Mage:** Ultimate charge amplification.
   - **Star Guardian:** Regenerates HP on flawless typing streaks.

3. **6 Progressive Sectors (World Map):**
   - Sector 01: Neon Academy (Beginner)
   - Sector 02: Crystal Forest (Intermediate)
   - Sector 03: Cyber Dungeon (Advanced)
   - Sector 04: Quantum City (Expert)
   - Sector 05: Void Station (Master)
   - Sector 06: The Singularity (Grandmaster)

4. **Adaptive Neural Lab:**
   - Monitors player keystroke mistakes by character (`T`, `R`, `Q`, `P`, etc.).
   - Dynamically re-injects counter-training word matrices.

5. **Multiplayer Arena:**
   - Typing Race mode with live percentage bars.
   - Co-Op Raid Boss fights.
   - 1v1 PvP Magic Duels.
   - Friend system & Private Room Codes.

6. **RPG Progression & Daily Bounties:**
   - Leveling up, XP curve, and sector unlocking.
   - Real-time combat telemetry (WPM, Accuracy %, Damage, Errors, Combo, Time).
   - Daily Missions with claimable XP and titles.

---

## 🚀 How to Deploy to Vercel

### Option 1: Via Vercel CLI (Terminal)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log into your Vercel account:
   ```bash
   vercel login
   ```
3. Deploy this project:
   ```bash
   vercel
   ```
   *(For production deployment, run `vercel --prod`)*

---

### Option 2: Deploy via GitHub (Recommended)

1. Create a new repository on [GitHub](https://github.com/new).
2. Push this local git repository to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and click **"Add New..."** > **"Project"**.
4. Import your GitHub repository and click **Deploy**. Vercel will automatically detect Vite and publish the site!
