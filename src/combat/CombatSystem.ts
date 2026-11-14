// Developer 1: range, damage, and cooldown handling.
// Pure TypeScript: no Phaser imports, so it can be unit-tested and run headless.
import type { Unit } from '../core/types';

interface CooldownRecord {
  lastAttackAt: number; // ms
  cooldown: number; // ms
}

/**
 * Generic combat rules shared by the player, summons, and zombies.
 * Range is horizontal distance in pixels; cooldowns are in milliseconds.
 * `now` is any monotonic ms clock (e.g. Phaser's `time` in update()).
 */
export class CombatSystem {
  private cooldowns = new Map<string, CooldownRecord>();

  /** True if the target is within the attacker's horizontal range. */
  isInRange(attacker: Unit, target: Unit): boolean {
    return Math.abs(attacker.x - target.x) <= attacker.stats.range;
  }

  /** Closest alive candidate in range (excluding the attacker itself), or null. */
  findClosestTarget(attacker: Unit, candidates: readonly Unit[]): Unit | null {
    let closest: Unit | null = null;
    let closestDistance = Infinity;

    for (const candidate of candidates) {
      if (candidate.id === attacker.id) continue;
      if (!candidate.isAlive()) continue;
      if (!this.isInRange(attacker, candidate)) continue;

      const distance = Math.abs(attacker.x - candidate.x);
      if (distance < closestDistance) {
        closest = candidate;
        closestDistance = distance;
      }
    }
    return closest;
  }

  /** True if this attacker has never attacked, or its cooldown has elapsed. */
  canAttack(attackerId: string, now: number): boolean {
    const record = this.cooldowns.get(attackerId);
    if (!record) return true;
    return now - record.lastAttackAt >= record.cooldown;
  }

  /**
   * Attack if both units are alive, the target is in range, and the attacker
   * is off cooldown. Returns true if damage was dealt.
   */
  attack(attacker: Unit, target: Unit, now: number): boolean {
    if (!attacker.isAlive() || !target.isAlive()) return false;
    if (!this.isInRange(attacker, target)) return false;
    if (!this.canAttack(attacker.id, now)) return false;

    target.takeDamage(attacker.stats.attack);
    this.cooldowns.set(attacker.id, {
      lastAttackAt: now,
      cooldown: attacker.stats.attackCooldown,
    });
    return true;
  }

  /** Forget an attacker's cooldown (e.g. when a unit is removed or respawns). */
  reset(attackerId: string): void {
    this.cooldowns.delete(attackerId);
  }
}
