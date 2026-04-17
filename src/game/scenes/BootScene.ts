import Phaser from "phaser";
import { AUDIO_ASSETS, IMAGE_ASSETS } from "../assets";
import { FAIRY_FLAP_FPS, FAIRY_FRAME_COUNT, FAIRY_FRAME_HEIGHT, FAIRY_FRAME_WIDTH } from "../config";
import { buildFairySpriteSheetFromLoadedImage } from "../registerFairySpriteSheet";

const FAIRY_SHEET_IMAGE_KEY = "__fairy_sheet_png__";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, "Caricamento...", {
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    Object.entries(IMAGE_ASSETS).forEach(([key, path]) => {
      if (key === "fairy") {
        this.load.image(FAIRY_SHEET_IMAGE_KEY, path);
        return;
      }
      this.load.image(key, path);
    });

    Object.entries(AUDIO_ASSETS).forEach(([key, path]) => {
      this.load.audio(key, path);
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.warn("[loader] asset non caricato:", file.key, file.url);
    });
  }

  create(): void {
    if (!this.textures.exists("background")) {
      const g = this.add.graphics();
      g.fillGradientStyle(0x8fd8ff, 0x8fd8ff, 0x4f94d4, 0x4f94d4, 1);
      g.fillRect(0, 0, 480, 800);
      g.generateTexture("background", 480, 800);
      g.destroy();
    }

    if (this.textures.exists(FAIRY_SHEET_IMAGE_KEY)) {
      buildFairySpriteSheetFromLoadedImage(this, FAIRY_SHEET_IMAGE_KEY, "fairy");
    }

    if (!this.textures.exists("fairy")) {
      const g = this.add.graphics();
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

    if (!this.textures.exists("pipe")) {
      const g = this.add.graphics();
      g.fillStyle(0x4caf50, 1);
      g.fillRect(0, 0, 80, 420);
      g.fillStyle(0x2e7d32, 1);
      g.fillRect(0, 0, 80, 34);
      g.generateTexture("pipe", 80, 420);
      g.destroy();
    }

    if (!this.textures.exists("vinyl")) {
      const g = this.add.graphics();
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

    if (this.anims.exists("fairy-flap")) {
      this.anims.remove("fairy-flap");
    }
    this.anims.create({
      key: "fairy-flap",
      frames: this.anims.generateFrameNumbers("fairy", {
        start: 0,
        end: FAIRY_FRAME_COUNT - 1,
      }),
      frameRate: FAIRY_FLAP_FPS,
      repeat: -1,
    });

    this.scene.start("MenuScene");
  }
}
