import Phaser from "phaser";
import { AUDIO_ASSETS, IMAGE_ASSETS } from "../assets";
import { auditBootAssets, formatBootAssetErrors } from "../boot/auditBootAssets";
import { FAIRY_SHEET_IMAGE_KEY } from "../boot/constants";
import { ensureProductionFallbackTextures } from "../boot/ensureProductionFallbackTextures";
import { FAIRY_FLAP_FPS, FAIRY_FRAME_COUNT } from "../config";
import { buildFairySpriteSheetFromLoadedImage } from "../registerFairySpriteSheet";

export class BootScene extends Phaser.Scene {
  private failedKeys = new Set<string>();
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super("BootScene");
  }

  preload(): void {
    const { width, height } = this.scale;
    this.statusText = this.add
      .text(width / 2, height / 2, "Caricamento...", {
        fontSize: "28px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 48 },
      })
      .setOrigin(0.5);

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
      this.failedKeys.add(file.key);
      console.warn("[loader] asset non caricato:", file.key, file.url);
    });
  }

  create(): void {
    if (this.textures.exists(FAIRY_SHEET_IMAGE_KEY)) {
      buildFairySpriteSheetFromLoadedImage(this, FAIRY_SHEET_IMAGE_KEY, "fairy");
    }

    const audit = auditBootAssets(this, this.failedKeys);

    if (import.meta.env.DEV) {
      if (!audit.ok) {
        const message = formatBootAssetErrors(audit);
        console.error("[BootScene] caricamento incompleto:\n", message);
        this.statusText?.setText(`Errore caricamento asset\n\n${message}`);
        this.statusText?.setColor("#ff8a8a");
        return;
      }
    } else if (!audit.ok) {
      ensureProductionFallbackTextures(this);
    }

    if (!this.textures.exists("fairy")) {
      console.error("[BootScene] texture fairy assente dopo boot");
      this.statusText?.setText("Errore: spritesheet fatina non disponibile");
      this.statusText?.setColor("#ff8a8a");
      return;
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
