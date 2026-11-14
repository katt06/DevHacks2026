// Phaser entry point (shared)
import Phaser from 'phaser';
import { GameScene, GAME_WIDTH, GAME_HEIGHT } from './scenes/GameScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1e1e24',
  scene: [GameScene],
});
