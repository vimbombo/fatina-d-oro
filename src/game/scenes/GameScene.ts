import Phaser from "phaser";
import {
  BACKGROUND_REVEAL_VISUALS,
  FAIRY_HITBOX_RADIUS_MAX,
  FAIRY_HITBOX_RADIUS_MIN,
  FAIRY_HITBOX_RADIUS_RATIO,
  GAME_HEIGHT,
  GAME_WIDTH,
  GAMEPLAY,
  MUSIC_VOLUME,
} from "../config";
import { InputController } from "../input/InputController";
import { resumeWebAudioFromUserGesture } from "../resumeWebAudio";
import { AudioSettingsStore } from "../state/AudioSettingsStore";
import { DifficultySystem } from "../systems/Difficulty";
import { Spawner } from "../systems/Spawner";
import { ParallaxBackgroundLayers } from "../background/ParallaxBackgroundLayers";

export class GameScene extends Phaser.Scene {
  private static readonly REVEAL_TEXT = "Verzino d'Oro 2026";

  private fairy!: Phaser.Physics.Arcade.Sprite;
  private topPipes!: Phaser.Physics.Arcade.Group;
  private bottomPipes!: Phaser.Physics.Arcade.Group;
  private discs!: Phaser.Physics.Arcade.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private revealLineTexts: Phaser.GameObjects.Text[] = [];
  private revealLineRanges: Array<{ start: number; end: number }> = [];
  private revealedCharIndices = new Set<number>();
  private revealableCharIndices: number[] = [];
  private inputController!: InputController;
  private spawner!: Spawner;
  private difficulty = new DifficultySystem();
  private spawnTimer = 0;
  private score = 0;
  private gameStartedAt = 0;
  private isDead = false;
  private music?: Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
  private clip1Sound?: Phaser.Sound.BaseSound;
  private musicVolumeBeforeClip1?: number;
  private parallax?: ParallaxBackgroundLayers;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.physics.resume();
    this.isDead = false;
    this.score = 0;
    this.spawnTimer = 0;
    this.music?.stop();

    const background = this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(-6);
    if (background.height > 0) {
      const scale = GAME_HEIGHT / background.height;
      background.setScale(scale);
    }
    this.parallax = new ParallaxBackgroundLayers(this, [
      "backgroundParallax2",
      "backgroundParallax3",
      "backgroundParallax4",
      "backgroundParallax5",
    ]);
    this.add.text(16, 16, "Fatina d'Oro", { fontSize: "24px", color: "#ffffff" }).setDepth(20);

    this.topPipes = this.physics.add.group();
    this.bottomPipes = this.physics.add.group();
    this.discs = this.physics.add.group();

    this.fairy = this.physics.add.sprite(130, GAME_HEIGHT / 2, "fairy");
    this.fairy.setOrigin(0.5, 0.5);
    this.applyFairyHitbox();
    this.fairy.setCollideWorldBounds(false);
    this.fairy.play("fairy-flap");
    this.fairy.setDepth(15);

    this.spawner = new Spawner(this, this.topPipes, this.bottomPipes, this.discs);
    this.inputController = new InputController(this);
    this.inputController.bind();

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 32, "0", {
        fontSize: "52px",
        color: "#fff7cc",
        stroke: "#7a5000",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(25);
    this.setupBackgroundReveal();

    this.physics.add.overlap(
      this.fairy,
      this.topPipes,
      () => this.triggerGameOver(),
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.fairy,
      this.bottomPipes,
      () => this.triggerGameOver(),
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.fairy,
      this.discs,
      (_fairy, disc) => this.collectDisc(disc as Phaser.GameObjects.GameObject),
      undefined,
      this,
    );

    void resumeWebAudioFromUserGesture(this).then(() => {
      this.tryStartMusic();
    });
    this.gameStartedAt = this.time.now;

    this.events.once("shutdown", () => {
      this.spawner.clear();
      this.restoreMusicVolumeAfterClip1();
      this.clip1Sound?.stop();
      this.clip1Sound = undefined;
      this.musicVolumeBeforeClip1 = undefined;
      this.inputController.destroy();
      this.parallax?.destroy();
      this.parallax = undefined;
      this.revealLineTexts.forEach((line) => line.destroy());
      this.revealLineTexts = [];
      this.revealLineRanges = [];
      this.revealedCharIndices.clear();
      this.revealableCharIndices = [];
    });
  }

  update(_time: number, delta: number): void {
    if (this.isDead) {
      return;
    }

    if (this.inputController.consumePress()) {
      this.fairy.setVelocityY(GAMEPLAY.flapVelocity);
      this.fairy.setAngle(-15);
      try {
        if (!AudioSettingsStore.isSfxMuted() && this.cache.audio.exists("flap")) {
          this.sound.play("flap", { volume: 0.5 });
        }
      } catch {
        // Ignore optional audio errors when assets are missing.
      }
    } else {
      this.fairy.setAngle(Math.min(this.fairy.angle + 1.4, 70));
    }

    this.spawnTimer += delta;
    const elapsed = this.time.now - this.gameStartedAt;
    const speed = GAMEPLAY.basePipeSpeed + this.difficulty.getSpeedBonus(elapsed);
    const gap = this.difficulty.getPipeGap(elapsed);

    this.parallax?.tick(speed, delta);

    if (this.spawnTimer >= GAMEPLAY.pipeSpawnMs) {
      this.spawnTimer = 0;
      this.spawner.spawn(gap, speed);
    }

    const newPoints = this.spawner.update(speed, this.fairy.x);
    if (newPoints > 0) {
      this.addScore(newPoints);
      try {
        if (!AudioSettingsStore.isSfxMuted() && this.cache.audio.exists("point")) {
          this.sound.play("point", { volume: 0.45 });
        }
      } catch {
        // Ignore optional audio errors when assets are missing.
      }
    }

    if (this.fairy.y < -30 || this.fairy.y > GAME_HEIGHT + 20) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.fairy.setVelocity(0, 0);
    this.physics.pause();
    try {
      if (!AudioSettingsStore.isSfxMuted() && this.cache.audio.exists("hit")) {
        this.sound.play("hit", { volume: 0.6 });
      }
    } catch {
      // Ignore optional audio errors when assets are missing.
    }
    this.restoreMusicVolumeAfterClip1();
    this.music?.stop();
    this.clip1Sound?.stop();
    this.cameras.main.shake(180, 0.01);
    this.time.delayedCall(450, () => {
      this.scene.launch("GameOverScene", { score: this.score });
      this.scene.pause();
    });
  }

  private collectDisc(discBody: Phaser.GameObjects.GameObject): void {
    const disc = discBody as Phaser.Physics.Arcade.Image;
    const popupX = disc.x;
    const popupY = disc.y;
    disc.disableBody(true, true);
    this.addScore(5);
    this.showScorePopup("+5", popupX, popupY);

    try {
      if (!AudioSettingsStore.isSfxMuted() && this.cache.audio.exists("clip1")) {
        if (!this.clip1Sound) {
          this.clip1Sound = this.sound.add("clip1", { volume: 0.7 });
        }
        if (!this.clip1Sound.isPlaying) {
          if (this.music && this.musicVolumeBeforeClip1 === undefined) {
            this.musicVolumeBeforeClip1 = this.music.volume;
            this.music.setVolume(this.music.volume * 0.1);
          }
          // Re-register each play: `.once` on create only fired for the first playback.
          this.clip1Sound.once(Phaser.Sound.Events.COMPLETE, () => {
            this.restoreMusicVolumeAfterClip1();
          });
          this.clip1Sound.play();
        }
      }
    } catch {
      // Ignore optional audio errors when assets are missing.
    }
  }

  private restoreMusicVolumeAfterClip1(): void {
    if (!this.music || this.musicVolumeBeforeClip1 === undefined) {
      return;
    }
    this.music.setVolume(this.musicVolumeBeforeClip1);
    this.musicVolumeBeforeClip1 = undefined;
  }

  private addScore(points: number): void {
    this.score += points;
    this.scoreText.setText(String(this.score));
    this.updateBackgroundRevealFromScore();
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  private showScorePopup(label: string, x: number, y: number): void {
    const popup = this.add
      .text(x, y, label, {
        fontSize: "34px",
        fontStyle: "bold",
        color: "#ffe17a",
        stroke: "#3a2800",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.tweens.add({
      targets: popup,
      y: y - 60,
      alpha: 0,
      duration: 520,
      ease: "Cubic.easeOut",
      onComplete: () => popup.destroy(),
    });
  }

  private applyFairyHitbox(): void {
    const { width, height, displayOriginX, displayOriginY } = this.fairy;
    const r = Phaser.Math.Clamp(
      Math.round(Math.min(width, height) * FAIRY_HITBOX_RADIUS_RATIO),
      FAIRY_HITBOX_RADIUS_MIN,
      FAIRY_HITBOX_RADIUS_MAX,
    );
    const offsetX = displayOriginX - r;
    const offsetY = displayOriginY - r;
    this.fairy.setCircle(r, offsetX, offsetY);
  }

  private tryStartMusic(): void {
    if (AudioSettingsStore.isMusicMuted()) {
      return;
    }
    if (!this.cache.audio.exists("music")) {
      if (import.meta.env.DEV) {
        console.warn("[audio] 'music' non in cache (file non caricato o load error).");
      }
      return;
    }

    try {
      this.music = this.sound.add("music", {
        loop: true,
        volume: MUSIC_VOLUME,
      }) as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
      this.music.play();
    } catch (e) {
      this.music = undefined;
      if (import.meta.env.DEV) {
        console.warn("[audio] musica non avviata:", e);
      }
    }
  }

  private setupBackgroundReveal(): void {
    this.revealedCharIndices.clear();
    this.revealableCharIndices = [];
    this.revealLineRanges = this.splitTextIntoThreeLines(GameScene.REVEAL_TEXT);

    for (let i = 0; i < GameScene.REVEAL_TEXT.length; i += 1) {
      if (GameScene.REVEAL_TEXT[i] !== " ") {
        this.revealableCharIndices.push(i);
      }
    }

    const baseY = GAME_HEIGHT * BACKGROUND_REVEAL_VISUALS.baseYRatio;
    this.revealLineTexts = this.revealLineRanges.map((_, index) =>
      this.add
        .text(GAME_WIDTH / 2, baseY + index * BACKGROUND_REVEAL_VISUALS.lineGapPx, "", {
          fontSize: `${BACKGROUND_REVEAL_VISUALS.fontSizePx}px`,
          fontStyle: BACKGROUND_REVEAL_VISUALS.fontStyle,
          color: BACKGROUND_REVEAL_VISUALS.lineColors[index % BACKGROUND_REVEAL_VISUALS.lineColors.length],
          stroke: BACKGROUND_REVEAL_VISUALS.strokeColor,
          strokeThickness: BACKGROUND_REVEAL_VISUALS.strokeThickness,
        })
        .setOrigin(0.5)
        .setDepth(BACKGROUND_REVEAL_VISUALS.depth)
        .setAlpha(BACKGROUND_REVEAL_VISUALS.alpha),
    );

    this.renderBackgroundReveal();
  }

  private updateBackgroundRevealFromScore(): void {
    const targetVisible = Math.min(
      Math.floor(this.score / GAMEPLAY.revealPointsPerChar),
      this.revealableCharIndices.length,
    );

    while (this.revealedCharIndices.size < targetVisible) {
      const candidates = this.revealableCharIndices.filter(
        (index) => !this.revealedCharIndices.has(index),
      );
      if (candidates.length === 0) {
        break;
      }
      const randomIndex = Phaser.Math.Between(0, candidates.length - 1);
      this.revealedCharIndices.add(candidates[randomIndex]);
    }

    this.renderBackgroundReveal();
  }

  private renderBackgroundReveal(): void {
    this.revealLineRanges.forEach((range, lineIndex) => {
      const revealedLineChars: string[] = [];
      for (let i = range.start; i < range.end; i += 1) {
        const char = GameScene.REVEAL_TEXT[i];
        const isVisible = this.revealedCharIndices.has(i);
        revealedLineChars.push(isVisible ? char : " ");
      }
      this.revealLineTexts[lineIndex]?.setText(revealedLineChars.join(""));
    });
  }

  private splitTextIntoThreeLines(text: string): Array<{ start: number; end: number }> {
    const words = text.split(" ");
    const totalLength = text.length;
    const targetPerLine = Math.ceil(totalLength / 3);
    const ranges: Array<{ start: number; end: number }> = [];

    let cursor = 0;
    let wordStart = 0;

    for (let line = 0; line < 2; line += 1) {
      let lineLength = 0;
      while (wordStart < words.length) {
        const nextWord = words[wordStart];
        const extraSpace = lineLength === 0 ? 0 : 1;
        const projectedLength = lineLength + extraSpace + nextWord.length;
        if (lineLength > 0 && projectedLength > targetPerLine) {
          break;
        }
        lineLength = projectedLength;
        wordStart += 1;
      }

      const start = cursor;
      const end = Math.min(start + lineLength, text.length);
      ranges.push({ start, end });
      cursor = end + 1;
    }

    ranges.push({ start: Math.min(cursor, text.length), end: text.length });

    while (ranges.length < 3) {
      ranges.push({ start: text.length, end: text.length });
    }

    return ranges.slice(0, 3);
  }
}
