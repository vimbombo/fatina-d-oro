import Phaser from "phaser";
import {
  FAIRY_FRAME_COUNT,
  FAIRY_FRAME_HEIGHT,
  FAIRY_FRAME_WIDTH,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../config";

export function ensureProductionFallbackTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists("background")) {
    const g = scene.add.graphics();
    g.fillGradientStyle(0x8fd8ff, 0x8fd8ff, 0x4f94d4, 0x4f94d4, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.generateTexture("background", GAME_WIDTH, GAME_HEIGHT);
    g.destroy();
  }

  if (!scene.textures.exists("fairy")) {
    const g = scene.add.graphics();
    const cx = FAIRY_FRAME_WIDTH / 2;
    const cy = FAIRY_FRAME_HEIGHT / 2;
    const bodyW = Math.max(28, FAIRY_FRAME_WIDTH * 0.56);
    const bodyH = Math.max(22, FAIRY_FRAME_HEIGHT * 0.56);
    const wingW = Math.max(12, FAIRY_FRAME_WIDTH * 0.24);
    const wingH = Math.max(8, FAIRY_FRAME_HEIGHT * 0.18);
    for (let i = 0; i < FAIRY_FRAME_COUNT; i += 1) {
      const offsetX = i * FAIRY_FRAME_WIDTH;
      const wingLift = i % 2 === 0 ? 0 : -3;
      g.fillStyle(0xffd66b, 1);
      g.fillEllipse(offsetX + cx, cy, bodyW, bodyH);
      g.fillStyle(0xffffff, 0.9);
      g.fillEllipse(offsetX + cx - bodyW * 0.36, cy - bodyH * 0.08 + wingLift, wingW, wingH);
      g.fillEllipse(offsetX + cx + bodyW * 0.36, cy - bodyH * 0.08 - wingLift, wingW, wingH);
    }
    g.generateTexture("fairy", FAIRY_FRAME_WIDTH * FAIRY_FRAME_COUNT, FAIRY_FRAME_HEIGHT);
    g.destroy();
    console.warn("Using fallback fairy spritesheet. Add public/assets/images/fatina-volante2.png");
  }

  if (!scene.textures.exists("pipe")) {
    const g = scene.add.graphics();
    g.fillStyle(0x4caf50, 1);
    g.fillRect(0, 0, 80, 420);
    g.fillStyle(0x2e7d32, 1);
    g.fillRect(0, 0, 80, 34);
    g.generateTexture("pipe", 80, 420);
    g.destroy();
  }

  if (!scene.textures.exists("vinyl")) {
    const g = scene.add.graphics();
    g.fillStyle(0x141414, 1);
    g.fillCircle(24, 24, 24);
    g.fillStyle(0x262626, 1);
    g.fillCircle(24, 24, 16);
    g.fillStyle(0x8d1e1e, 1);
    g.fillCircle(24, 24, 7);
    g.fillStyle(0xf5f1c6, 1);
    g.fillCircle(24, 24, 2);
    g.generateTexture("vinyl", 48, 48);
    g.destroy();
  }
}
