# Samurai vs. Zombies — 2D MVP

Phaser 3 + TypeScript + Vite project **folder scaffold**. This is not yet a playable game: gameplay classes are placeholders.

## Team split
- **Developer 1:** `src/player/`, `src/combat/`
- **Developer 2:** `src/enemies/`, `src/summons/`, `src/systems/`
- **Shared:** `src/core/`, `src/scenes/`, `src/ui/`, `src/main.ts`

## Start
1. Install Node.js (LTS).
2. Run `npm install`.
3. Run `npm run dev`.

**Note:** The Phaser scene and game initialization still need to be implemented before anything renders.

## MVP scope
One lane, one player, one zombie enemy type, one ally summon, gold, waves, and base health. No elemental system.
