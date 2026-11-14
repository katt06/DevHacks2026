
import Phaser from "phaser";
import type { Stats, Unit } from "../core/types";

export class Enemy extends Phaser.GameObjects.Rectangle implements Unit {
  id: string;
  stats: Stats;
  health: number;

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

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isAlive(): boolean {
    return this.health > 0 && this.active;
  }

  
  update(time: number, delta: number): void {
    if (!this.isAlive()) return;

    // Move toward the player's base (left side).
    this.x -= this.stats.moveSpeed * (delta / 1000);
  }

}