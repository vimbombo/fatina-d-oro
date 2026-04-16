import Phaser from "phaser";
import "./style.css";
import { GAME_CONFIG } from "./game/config";
import { isFairyTestMode } from "./game/fairyTestUrl";
import { BootScene } from "./game/scenes/BootScene";
import { MenuScene } from "./game/scenes/MenuScene";
import { GameScene } from "./game/scenes/GameScene";
import { GameOverScene } from "./game/scenes/GameOverScene";
import { FairyTestScene } from "./game/scenes/FairyTestScene";

const fairyTest = isFairyTestMode();

if (import.meta.env.DEV) {
  console.info(
    fairyTest
      ? "[Fatina] Modalità FairyTestScene attiva."
      : "[Fatina] Gioco normale. Per la scena di test: ?scene=fairy oppure #fairy oppure npm run dev:fairy",
  );
}

const game = new Phaser.Game({
  ...GAME_CONFIG,
  scene: fairyTest
    ? [FairyTestScene, BootScene, MenuScene, GameScene, GameOverScene]
    : [BootScene, MenuScene, GameScene, GameOverScene],
});

window.addEventListener("resize", () => game.scale.refresh());
