
import Phaser from "phaser";
import type { Stats, Unit } from "../core/types";

export class Enemy extends Phaser.GameObjects.Rectangle implements Unit {
  id: string;
  stats: Stats;
  health: number;
  private target: Unit | null = null;
  private lastAttackTime = -Infinity;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 30, 50, 0xe74c3c);

    this.id = crypto.randomUUID();

    this.stats = {
      maxHealth: 100,
      attack: 10,
      range: 40,
      attackCooldown: 1000,
      moveSpeed: 50,
    };

    this.health = this.stats.maxHealth;

    scene.add.existing(this);
  }

  setTarget(target: Unit | null): void {
    this.target = target;
  }

  private attack(time: number): void {
    if (!this.target || !this.target.isAlive()) return;

    if (time - this.lastAttackTime >= this.stats.attackCooldown) {
      this.target.takeDamage(this.stats.attack);
      this.lastAttackTime = time;
    }
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isAlive(): boolean {
    return this.health > 0 && this.active;
  }

  update(time: number, delta: number): void {
    if (!this.isAlive()) return;

    if (this.target && this.target.isAlive()) {
      const distance = Math.abs(this.x - this.target.x);

      if (distance <= this.stats.range) {
        this.attack(time);
        return;
      }
    }

    this.x -= this.stats.moveSpeed * (delta / 1000);
  }
}