import Phaser from "phaser";
import { AUDIO_ASSETS, IMAGE_ASSETS } from "../assets";
import { FAIRY_FLAP_FPS, FAIRY_FRAME_COUNT, GAME_HEIGHT, GAME_WIDTH } from "../config";
import { buildFairySpriteSheetFromLoadedImage } from "../registerFairySpriteSheet";
import { resumeWebAudioFromUserGesture } from "../resumeWebAudio";

const FAIRY_TEST_IMAGE_KEY = "__fairy_test_sheet_png__";
/** File piccolo per test (stesso di gioco). */
const AUDIO_TEST_KEY = "__fairy_test_point__";

export class FairyTestScene extends Phaser.Scene {
  constructor() {
    super("FairyTestScene");
  }

  preload(): void {
    this.load.once("loaderror", (file: Phaser.Loader.File) => {
      console.error("[FairyTestScene] loaderror:", file.key, file.url);
    });
    this.load.image(FAIRY_TEST_IMAGE_KEY, IMAGE_ASSETS.fairy);
    this.load.audio(AUDIO_TEST_KEY, AUDIO_ASSETS.point);
  }

  create(): void {
    this.add.text(16, 16, "FairyTestScene", {
      fontSize: "22px",
      color: "#ffffff",
    }).setDepth(10);

    this.add.text(16, 44, "M = Menu (Boot) · niente clic globale (serve al test audio)", {
      fontSize: "15px",
      color: "#ffffff",
    }).setDepth(10);

    const audioLog = (msg: string, extra?: unknown) => {
      const line = extra !== undefined ? `${msg} ${JSON.stringify(extra)}` : msg;
      console.info("[FairyTest audio]", line);
    };

    const ctx = (this.sound as unknown as { context?: AudioContext }).context;
    const status = this.add
      .text(16, 100, `AudioContext: ${ctx?.state ?? "?"}\nCache '${AUDIO_TEST_KEY}': ${this.cache.audio.exists(AUDIO_TEST_KEY) ? "sì" : "no"}`, {
        fontSize: "14px",
        color: "#fff7cc",
        lineSpacing: 4,
      })
      .setDepth(10);

    const setStatus = (lines: string[]) => {
      status.setText(lines.join("\n"));
    };

    const playTest = () => {
      audioLog("click PROVA SUONO");
      void resumeWebAudioFromUserGesture(this).then(() => {
        const c = (this.sound as unknown as { context?: AudioContext }).context;
        audioLog("dopo resume()", { state: c?.state });
        setStatus([
          `AudioContext: ${c?.state ?? "?"}`,
          `Cache '${AUDIO_TEST_KEY}': ${this.cache.audio.exists(AUDIO_TEST_KEY) ? "sì" : "no"}`,
          "Ultimo: resume OK, invio play…",
        ]);
        try {
          this.sound.play(AUDIO_TEST_KEY, { volume: 0.65 });
          audioLog("sound.play inviato");
          setStatus([
            `AudioContext: ${c?.state ?? "?"}`,
            `Cache: ok`,
            "Ultimo: play() chiamato (senti point.ogg?)",
          ]);
        } catch (e) {
          audioLog("play errore", String(e));
          setStatus([`Errore play: ${String(e)}`]);
        }
      });
    };

    this.add
      .text(GAME_WIDTH / 2, 168, "PROVA SUONO (point.ogg)", {
        fontSize: "22px",
        color: "#1a1a2e",
        backgroundColor: "#7ee787",
        padding: { x: 18, y: 12 },
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        playTest();
      });

    this.add
      .text(GAME_WIDTH / 2, 232, "MENU → BootScene", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#e38a2d",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.scene.start("BootScene");
      });

    buildFairySpriteSheetFromLoadedImage(this, FAIRY_TEST_IMAGE_KEY, "fairy-test");

    if (!this.textures.exists("fairy-test")) {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `Texture "fairy-test" mancante.\n${IMAGE_ASSETS.fairy}`, {
          fontSize: "16px",
          color: "#ff6666",
          align: "center",
          wordWrap: { width: GAME_WIDTH - 48 },
        })
        .setOrigin(0.5)
        .setDepth(20);
    } else {
      const sprite = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, "fairy-test", 0);
      sprite.setOrigin(0.5, 0.5);
      const testZoom = 2.5;
      sprite.setScale(testZoom);

      if (this.anims.exists("fairy-test-flap")) {
        this.anims.remove("fairy-test-flap");
      }
      this.anims.create({
        key: "fairy-test-flap",
        frames: this.anims.generateFrameNumbers("fairy-test", {
          start: 0,
          end: FAIRY_FRAME_COUNT - 1,
        }),
        frameRate: FAIRY_FLAP_FPS,
        repeat: -1,
      });
      sprite.play("fairy-test-flap");

      const fw = sprite.frame.width;
      const fh = sprite.frame.height;
      this.add.text(16, GAME_HEIGHT - 52, `Frame: ${fw}×${fh} · scala ×${testZoom}`, {
        fontSize: "13px",
        color: "#ffffff",
      }).setDepth(10);
    }

    this.input.keyboard?.once("keydown-M", () => {
      this.scene.start("BootScene");
    });
  }
}
