import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, GAMEPLAY, START_SCENE_MUSIC_VOLUME } from "../config";
import { resumeWebAudioFromUserGesture } from "../resumeWebAudio";
import { AudioSettingsStore } from "../state/AudioSettingsStore";
import { ScoreStore } from "../state/ScoreStore";
import { ParallaxBackgroundLayers } from "../background/ParallaxBackgroundLayers";

export class MenuScene extends Phaser.Scene {
  private hasNavigated = false;
  private parallax?: ParallaxBackgroundLayers;
  private music?: Phaser.Sound.BaseSound;

  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.hasNavigated = false;
    this.music?.stop();
    this.music = undefined;

    const background = this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(-6);
    if (background.height > 0) {
      const scale = GAME_HEIGHT / background.height;
      background.setScale(scale);
    }
    this.parallax = new ParallaxBackgroundLayers(this, [
      "backgroundParallax2",
      "backgroundParallax3",
      "backgroundParallax4",
    ]);

    this.add
      .text(GAME_WIDTH / 2, 200, "Fatina d'Oro", {
        fontSize: "58px",
        fontStyle: "bold",
        color: "#ffe28a",
        stroke: "#8a5b00",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(GAME_WIDTH / 2, 330, "Tocca o premi SPAZIO per volare", {
        fontSize: "26px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(GAME_WIDTH / 2, 390, `Miglior punteggio: ${ScoreStore.getBestScore()}`, {
        fontSize: "28px",
        color: "#fef4be",
      })
      .setOrigin(0.5)
      .setDepth(20);

    const start = this.add
      .text(GAME_WIDTH / 2, 500, "INIZIA", {
        fontSize: "44px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#e38a2d",
        padding: { x: 22, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    const musicToggle = this.add
      .text(GAME_WIDTH / 2 - 110, GAME_HEIGHT - 42, "", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#36576f",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    const sfxToggle = this.add
      .text(GAME_WIDTH / 2 + 110, GAME_HEIGHT - 42, "", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#36576f",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: start,
      y: 492,
      yoyo: true,
      repeat: -1,
      duration: 850,
      ease: "Sine.inOut",
    });

    void resumeWebAudioFromUserGesture(this).then(() => {
      this.tryStartMusic();
    });

    const refreshAudioButtons = () => {
      musicToggle.setText(AudioSettingsStore.isMusicMuted() ? "Musica: OFF" : "Musica: ON");
      sfxToggle.setText(AudioSettingsStore.isSfxMuted() ? "Suoni: OFF" : "Suoni: ON");
    };
    refreshAudioButtons();

    musicToggle.on("pointerdown", () => {
      const muted = AudioSettingsStore.toggleMusicMuted();
      if (muted) {
        this.music?.stop();
        this.music = undefined;
      } else {
        this.tryStartMusic();
      }
      refreshAudioButtons();
    });

    sfxToggle.on("pointerdown", () => {
      AudioSettingsStore.toggleSfxMuted();
      refreshAudioButtons();
    });

    const goToGame = () => {
      if (this.hasNavigated) {
        return;
      }
      this.hasNavigated = true;
      void resumeWebAudioFromUserGesture(this).then(() => {
        this.music?.stop();
        this.music = undefined;
        this.scene.start("GameScene");
      });
    };
    start.on("pointerdown", goToGame);
    this.input.keyboard?.once("keydown-SPACE", goToGame);

    this.events.once("shutdown", () => {
      this.music?.stop();
      this.music = undefined;
    });
  }

  update(_time: number, delta: number): void {
    const speed = GAMEPLAY.basePipeSpeed * 0.6;
    this.parallax?.tick(speed, delta);
  }

  private tryStartMusic(): void {
    if (AudioSettingsStore.isMusicMuted()) {
      return;
    }
    if (!this.cache.audio.exists("startmusic")) {
      return;
    }

    try {
      this.music = this.sound.add("startmusic", { loop: true, volume: START_SCENE_MUSIC_VOLUME });
      this.music.play();
    } catch {
      this.music = undefined;
    }
  }
}
