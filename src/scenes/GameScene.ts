// Main game scene (shared integration)
import Phaser from 'phaser';
import type { Unit } from '../core/types';
import { CombatSystem } from '../combat/CombatSystem';
import { Player } from '../player/Player';
import { DummyEnemy } from '../player/DummyEnemy';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const LANE_Y = 400; // center line of the lane
export const BASE_WIDTH = 80; // base occupies x = 0..BASE_WIDTH

/** Spawns stationary test dummies. Set to false once real zombies exist. */
const DEBUG_DUMMIES = true;

export class GameScene extends Phaser.Scene {
  private combat = new CombatSystem();
  private player!: Player;
  private enemies: Unit[] = []; // later: Developer 2's zombie list

  // DEBUG: test-only targets
  private dummies: DummyEnemy[] = [];

  constructor() {
    super('GameScene');
  }

  create(): void {
    // Base (gray) on the left
    this.add.rectangle(BASE_WIDTH / 2, LANE_Y, BASE_WIDTH, 120, 0x888888);

    // Player (Developer 1)
    this.player = new Player(this, BASE_WIDTH + 40, LANE_Y, BASE_WIDTH, GAME_WIDTH, this.combat);

    if (DEBUG_DUMMIES) {
      this.dummies = [new DummyEnemy(this, 400, LANE_Y), new DummyEnemy(this, 600, LANE_Y)];
    }
  }

  update(time: number, delta: number): void {
    const enemies = DEBUG_DUMMIES ? this.dummies : this.enemies;
    this.player.update(time, delta, enemies);

    if (DEBUG_DUMMIES) this.removeDeadDummies();
  }

  // DEBUG
  private removeDeadDummies(): void {
    this.dummies = this.dummies.filter((dummy) => {
      if (dummy.isAlive()) return true;
      dummy.destroy();
      this.combat.reset(dummy.id);
      return false;
    });
  }
}
