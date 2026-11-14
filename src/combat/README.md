# CombatSystem

Shared combat rules for the player, summons, and zombies. Pure TypeScript (no Phaser), so it's unit-tested in `CombatSystem.test.ts`.

- **One instance per game.** `GameScene` creates it (`this.combat`) and passes it into each unit's constructor. Use that shared instance rather than creating your own, so all cooldowns (and `reset()`) live in one place.
- **Units:** `stats.range` = horizontal distance in **pixels** (center to center); `stats.attackCooldown` = **milliseconds**.
- **`now`:** pass the `time` argument from Phaser's `update(time, delta)`.
- **Ids:** every unit needs a unique `id`; cooldowns are tracked per id.

| Method | What it does |
|---|---|
| `findClosestTarget(attacker, candidates)` | Closest alive unit in range (never the attacker itself), or `null` |
| `attack(attacker, target, now)` | If both alive, in range, and off cooldown: calls `target.takeDamage(attacker.stats.attack)` and returns `true` |
| `isInRange(attacker, target)` | Horizontal distance ≤ `attacker.stats.range` |
| `canAttack(attackerId, now)` | Off cooldown? |
| `reset(attackerId)` | Forget a unit's cooldown. Call when a unit is removed |

## Usage (inside Enemy or Summon)

```ts
update(time: number, delta: number): void {
  const target = this.combat.findClosestTarget(this, this.getTargets()); // Enemy: [player, ...summons]; Summon: zombies
  if (target) this.combat.attack(this, target, time);                    // damage + cooldown handled for you
  else this.x += this.direction * this.stats.moveSpeed * (delta / 1000); // nothing in range: keep walking
}
```

When a zombie or summon dies and you remove it, call `combat.reset(unit.id)`.
