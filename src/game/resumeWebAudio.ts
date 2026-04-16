import type { Scene } from "phaser";

/**
 * Riprende l'AudioContext di Phaser (Web Audio) nel flusso di un gesto utente.
 * Chiamalo da pointerdown / keydown prima di avviare suoni o cambiare scena.
 */
export function resumeWebAudioFromUserGesture(scene: Scene): Promise<void> {
  const ctx = (scene.sound as unknown as { context?: AudioContext }).context;
  if (!ctx || ctx.state !== "suspended") {
    return Promise.resolve();
  }
  return ctx.resume().catch(() => {
    /* ignore */
  });
}
