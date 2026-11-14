// Developer 1: player movement and basic attack
import Phaser from 'phaser';
import type { Stats, Unit } from '../core/types';

/** Tune the samurai here. range is px, attackCooldown is ms, moveSpeed is px/s. */
export const PLAYER_STATS: Stats = {
  maxHealth: 100,
  attack: 20,
  range: 60,
  attackCooldown: 600,
  moveSpeed: 200,
};

const WIDTH = 40;
const HEIGHT = 60;
const COLOR = 0x3b82f6; // blue

export class Player implements Unit {
  readonly id = 'player';
  readonly stats: Stats = { ...PLAYER_STATS };
  health = this.stats.maxHealth;
  x: number;
  y: number;

  private readonly rect: Phaser.GameObjects.Rectangle;
  private readonly keys: Record<'left' | 'right' | 'a' | 'd', Phaser.Input.Keyboard.Key>;
  private readonly minX: number;
  private readonly maxX: number;

  /**
   * @param x, y   Center position (y is the lane's center line).
   * @param minX   Left limit for the player's left edge (the base's right edge).
   * @param maxX   Right limit for the player's right edge (the screen edge).
   */
  constructor(scene: Phaser.Scene, x: number, y: number, minX: number, maxX: number) {
    this.minX = minX + WIDTH / 2;
    this.maxX = maxX - WIDTH / 2;
    this.x = Phaser.Math.Clamp(x, this.minX, this.maxX);
    this.y = y;

    this.rect = scene.add.rectangle(this.x, this.y, WIDTH, HEIGHT, COLOR);

    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      left: K.LEFT,
      right: K.RIGHT,
      a: K.A,
      d: K.D,
    }) as Player['keys'];
  }

  update(_time: number, delta: number): void {
    let direction = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) direction -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) direction += 1;

    const dx = direction * this.stats.moveSpeed * (delta / 1000);
    this.x = Phaser.Math.Clamp(this.x + dx, this.minX, this.maxX);
    this.rect.setPosition(this.x, this.y);
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isAlive(): boolean {
    return this.health > 0;
  }
}
