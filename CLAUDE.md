# Samurai vs Zombies

2D lane defense game for a hackathon. Phaser 3 + TypeScript + Vite.

## Game layout
- One straight horizontal lane.
- Base is on the LEFT. Zombies spawn on the RIGHT and walk toward the base.

## Team and ownership
Two developers. The user is **Developer 1: Player & Combat**.

| Area | Owner |
|------|-------|
| `src/player/`, `src/combat/` | Developer 1 (the user) |
| `src/enemies/`, `src/summons/`, `src/systems/` | Developer 2 |
| `src/core/types.ts`, `src/scenes/GameScene.ts`, `src/ui/HUD.ts` | Shared: change only with agreement |

## Rules
- Never edit Developer 2's folders (`src/enemies/`, `src/summons/`, `src/systems/`).
- Do not change `src/core/types.ts` without asking the user first.
- All damage goes through the `Unit` interface's `takeDamage(amount)`.
- Units: `Stats.range` is in pixels (horizontal distance); `Stats.attackCooldown` is in milliseconds.
- `CombatSystem` must be pure TypeScript with NO Phaser imports, so it can be unit-tested and reused in a headless simulation later.
- Use placeholder rectangles for graphics. No art, no elements, no skills, no upgrades yet.
- Keep code simple and readable; this is an MVP.

## Design decisions (Developer 1 scope)
- Attacking is automatic when a zombie is in range. Spacebar attack is optional.
- When the player dies, they respawn at the base after 3 seconds. Only base HP reaching 0 loses the game.
- Until merging with Developer 2, test against a self-made dummy zombie (keep it inside Developer 1's folders).
