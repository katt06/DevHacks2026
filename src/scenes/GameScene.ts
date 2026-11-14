// Main game scene (shared integration)
import Phaser from 'phaser';
import { Player } from '../player/Player';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const LANE_Y = 400; // center line of the lane
export const BASE_WIDTH = 80; // base occupies x = 0..BASE_WIDTH

export class GameScene extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super('GameScene');
  }

  create(): void {
    // Base (gray) on the left
    this.add.rectangle(BASE_WIDTH / 2, LANE_Y, BASE_WIDTH, 120, 0x888888);

    // Player (Developer 1)
    this.player = new Player(this, BASE_WIDTH + 40, LANE_Y, BASE_WIDTH, GAME_WIDTH);
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta);
  }
}
