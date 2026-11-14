// Developer 1: player movement and basic attack
import Phaser from 'phaser';
import type { Stats, Unit } from '../core/types';
import type { CombatSystem } from '../combat/CombatSystem';

/** Tune the samurai here. range is px, attackCooldown is ms, moveSpeed is px/s. */
export const PLAYER_STATS: Stats = {
  maxHealth: 100,
  attack: 20,
  range: 60,
  attackCooldown: 600,
  moveSpeed: 200,
};

export const RESPAWN_DELAY_MS = 3000;

const WIDTH = 40;
const HEIGHT = 60;
const COLOR = 0x3b82f6; // blue
const FLASH_COLOR = 0xffffff;
const FLASH_MS = 80;

const HP_BAR_WIDTH = 40;
const HP_BAR_HEIGHT = 5;
const HP_BAR_OFFSET_Y = HEIGHT / 2 + 8; // above the player's head

export class Player implements Unit {
  readonly id = 'player';
  readonly stats: Stats = { ...PLAYER_STATS };
  health = this.stats.maxHealth;
  x: number;
  y: number;

  /** Called once each time the player dies (e.g. for the HUD or GameScene). */
  onDeath?: () => void;

  private readonly scene: Phaser.Scene;
  private readonly combat: CombatSystem;
  private readonly rect: Phaser.GameObjects.Rectangle;
  private readonly hpBarBg: Phaser.GameObjects.Rectangle;
  private readonly hpBarFill: Phaser.GameObjects.Rectangle;
  private readonly keys: Record<'left' | 'right' | 'a' | 'd', Phaser.Input.Keyboard.Key>;
  private readonly minX: number;
  private readonly maxX: number;
  private readonly spawnX: number;

  /**
   * @param x, y   Spawn position, center (y is the lane's center line). Also the respawn point.
   * @param minX   Left limit for the player's left edge (the base's right edge).
   * @param maxX   Right limit for the player's right edge (the screen edge).
   * @param combat Shared CombatSystem (the same instance zombies and summons use).
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    minX: number,
    maxX: number,
    combat: CombatSystem,
  ) {
    this.scene = scene;
    this.combat = combat;
    this.minX = minX + WIDTH / 2;
    this.maxX = maxX - WIDTH / 2;
    this.spawnX = Phaser.Math.Clamp(x, this.minX, this.maxX);
    this.x = this.spawnX;
    this.y = y;

    this.rect = scene.add.rectangle(this.x, this.y, WIDTH, HEIGHT, COLOR);

    // HP bar: dark background with a green fill anchored on the left
    this.hpBarBg = scene.add.rectangle(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x222222);
    this.hpBarFill = scene.add
      .rectangle(0, 0, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x22c55e)
      .setOrigin(0, 0.5);
    this.syncVisuals();

    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard!.addKeys({
      left: K.LEFT,
      right: K.RIGHT,
      a: K.A,
      d: K.D,
    }) as Player['keys'];
  }

  /** @param enemies Anything the player may hit (dummies now, Developer 2's zombies later). */
  update(time: number, delta: number, enemies: readonly Unit[]): void {
    if (!this.isAlive()) return; // dead: no movement or attacks until respawn
    this.move(delta);
    this.autoAttack(time, enemies);
  }

  takeDamage(amount: number): void {
    if (!this.isAlive()) return;

    this.health = Math.max(0, this.health - amount);
    this.syncVisuals();

    if (this.health === 0) {
      this.die();
    } else {
      this.flash();
    }
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  private move(delta: number): void {
    let direction = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) direction -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) direction += 1;

    const dx = direction * this.stats.moveSpeed * (delta / 1000);
    this.x = Phaser.Math.Clamp(this.x + dx, this.minX, this.maxX);
    this.syncVisuals();
  }

  private autoAttack(time: number, enemies: readonly Unit[]): void {
    const target = this.combat.findClosestTarget(this, enemies);
    if (target) this.combat.attack(this, target, time);
  }

  private flash(): void {
    this.rect.setFillStyle(FLASH_COLOR);
    this.scene.time.delayedCall(FLASH_MS, () => {
      if (this.isAlive()) this.rect.setFillStyle(COLOR);
    });
  }

  private die(): void {
    this.setVisible(false);
    this.onDeath?.();
    this.scene.time.delayedCall(RESPAWN_DELAY_MS, () => this.respawn());
  }

  private respawn(): void {
    this.health = this.stats.maxHealth;
    this.x = this.spawnX;
    this.combat.reset(this.id);
    this.rect.setFillStyle(COLOR);
    this.syncVisuals();
    this.setVisible(true);
  }

  private setVisible(visible: boolean): void {
    this.rect.setVisible(visible);
    this.hpBarBg.setVisible(visible);
    this.hpBarFill.setVisible(visible);
  }

  /** Keep the rectangle and HP bar in sync with x/y/health. */
  private syncVisuals(): void {
    this.rect.setPosition(this.x, this.y);
    const barY = this.y - HP_BAR_OFFSET_Y;
    this.hpBarBg.setPosition(this.x, barY);
    this.hpBarFill.setPosition(this.x - HP_BAR_WIDTH / 2, barY);
    this.hpBarFill.width = HP_BAR_WIDTH * (this.health / this.stats.maxHealth);
  }
}
