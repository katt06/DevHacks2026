import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from './CombatSystem';
import type { Stats, Unit } from '../core/types';

const baseStats: Stats = {
  maxHealth: 100,
  attack: 10,
  range: 50, // px
  attackCooldown: 1000, // ms
  moveSpeed: 100,
};

function makeUnit(id: string, x: number, overrides: Partial<Stats> = {}): Unit {
  const stats = { ...baseStats, ...overrides };
  return {
    id,
    stats,
    health: stats.maxHealth,
    x,
    y: 0,
    takeDamage(amount: number) {
      this.health = Math.max(0, this.health - amount);
    },
    isAlive() {
      return this.health > 0;
    },
  };
}

describe('CombatSystem', () => {
  let combat: CombatSystem;

  beforeEach(() => {
    combat = new CombatSystem();
  });

  describe('range', () => {
    it('is in range when horizontal distance <= range', () => {
      const attacker = makeUnit('a', 100);
      expect(combat.isInRange(attacker, makeUnit('t1', 150))).toBe(true); // exactly 50
      expect(combat.isInRange(attacker, makeUnit('t2', 60))).toBe(true); // left side
    });

    it('is out of range when horizontal distance > range', () => {
      const attacker = makeUnit('a', 100);
      expect(combat.isInRange(attacker, makeUnit('t', 151))).toBe(false);
    });

    it('ignores vertical distance', () => {
      const attacker = makeUnit('a', 100);
      const target = makeUnit('t', 120);
      target.y = 999;
      expect(combat.isInRange(attacker, target)).toBe(true);
    });

    it('does not deal damage to an out-of-range target', () => {
      const attacker = makeUnit('a', 0);
      const target = makeUnit('t', 200);
      expect(combat.attack(attacker, target, 0)).toBe(false);
      expect(target.health).toBe(100);
    });

    it('deals attacker.stats.attack damage to an in-range target', () => {
      const attacker = makeUnit('a', 0, { attack: 25 });
      const target = makeUnit('t', 30);
      expect(combat.attack(attacker, target, 0)).toBe(true);
      expect(target.health).toBe(75);
    });
  });

  describe('cooldown', () => {
    it('blocks a second attack before the cooldown elapses', () => {
      const attacker = makeUnit('a', 0);
      const target = makeUnit('t', 10);

      expect(combat.attack(attacker, target, 1000)).toBe(true);
      expect(combat.canAttack('a', 1500)).toBe(false);
      expect(combat.attack(attacker, target, 1999)).toBe(false);
      expect(target.health).toBe(90);
    });

    it('allows attacking again once the cooldown has elapsed', () => {
      const attacker = makeUnit('a', 0);
      const target = makeUnit('t', 10);

      combat.attack(attacker, target, 1000);
      expect(combat.canAttack('a', 2000)).toBe(true);
      expect(combat.attack(attacker, target, 2000)).toBe(true);
      expect(target.health).toBe(80);
    });

    it('tracks cooldowns per attacker id', () => {
      const a = makeUnit('a', 0);
      const b = makeUnit('b', 0);
      const target = makeUnit('t', 10);

      expect(combat.attack(a, target, 0)).toBe(true);
      expect(combat.attack(b, target, 0)).toBe(true);
      expect(combat.attack(a, target, 500)).toBe(false);
      expect(target.health).toBe(80);
    });

    it('a failed attack does not start the cooldown', () => {
      const attacker = makeUnit('a', 0);
      const far = makeUnit('far', 500);
      combat.attack(attacker, far, 0);
      expect(combat.canAttack('a', 1)).toBe(true);
    });
  });

  describe('dead targets', () => {
    it('does not attack a dead target', () => {
      const attacker = makeUnit('a', 0);
      const target = makeUnit('t', 10);
      target.health = 0;
      expect(combat.attack(attacker, target, 0)).toBe(false);
      expect(combat.canAttack('a', 1)).toBe(true);
    });

    it('findClosestTarget skips dead units', () => {
      const attacker = makeUnit('a', 0);
      const deadClose = makeUnit('dead', 5);
      deadClose.health = 0;
      const aliveFar = makeUnit('alive', 40);
      expect(combat.findClosestTarget(attacker, [deadClose, aliveFar])).toBe(aliveFar);
    });

    it('returns null when every candidate is dead or out of range', () => {
      const attacker = makeUnit('a', 0);
      const dead = makeUnit('dead', 5);
      dead.health = 0;
      const far = makeUnit('far', 500);
      expect(combat.findClosestTarget(attacker, [dead, far])).toBeNull();
      expect(combat.findClosestTarget(attacker, [])).toBeNull();
    });
  });

  describe('findClosestTarget', () => {
    it('chooses the closest alive unit in range', () => {
      const attacker = makeUnit('a', 100);
      const mid = makeUnit('mid', 130);
      const closest = makeUnit('closest', 90); // 10px to the left
      const edge = makeUnit('edge', 150);
      expect(combat.findClosestTarget(attacker, [mid, edge, closest])).toBe(closest);
    });

    it('never targets the attacker itself', () => {
      const attacker = makeUnit('a', 100);
      const other = makeUnit('o', 120);
      expect(combat.findClosestTarget(attacker, [attacker, other])).toBe(other);
    });
  });
});
