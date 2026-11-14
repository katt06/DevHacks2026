// Shared interfaces — agree on these before implementing gameplay.
export interface Stats {
  maxHealth: number;
  attack: number;
  range: number;
  attackCooldown: number;
  moveSpeed: number;
}

export interface Unit {
  id: string;
  stats: Stats;
  health: number;
  x: number;
  y: number;

  takeDamage(amount: number): void;
  isAlive(): boolean;
}
