import { GAMEPLAY } from "../config";

export class DifficultySystem {
  getSpeedBonus(elapsedMs: number): number {
    const progress = Math.min(elapsedMs / 90000, 1);
    return progress * GAMEPLAY.maxSpeedBonus;
  }

  getPipeGap(elapsedMs: number): number {
    const steps = Math.floor(elapsedMs / GAMEPLAY.difficultyIntervalMs);
    const reduced = GAMEPLAY.basePipeGap - steps * 10;
    return Math.max(reduced, GAMEPLAY.minPipeGap);
  }
}
