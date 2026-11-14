// Developer 1: TEST ONLY. A stationary target until Developer 2's zombies exist.
import Phaser from 'phaser';
import type { Stats, Unit } from '../core/types';

const DUMMY_STATS: Stats = {
  maxHealth: 100,
  attack: 0,
  range: 0,
  attackCooldown: 0,
  moveSpeed: 0,
};

let nextId = 1;

export class DummyEnemy implements Unit {
  readonly id = `dummy-${nextId++}`;
  readonly stats: Stats = { ...DUMMY_STATS };
  health = this.stats.maxHealth;
  x: number;
  y: number;

  private readonly rect: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.rect = scene.add.rectangle(x, y, 40, 60, 0xdc2626); // red
    this.label = scene.add
      .text(x, y - 45, '', { fontSize: '14px', color: '#ffffff' })
      .setOrigin(0.5);
    this.refreshLabel();
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.refreshLabel();
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  destroy(): void {
    this.rect.destroy();
    this.label.destroy();
  }

  private refreshLabel(): void {
    this.label.setText(`${this.health}`);
  }
}
