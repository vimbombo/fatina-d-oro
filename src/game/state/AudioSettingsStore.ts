const MUSIC_MUTED_KEY = "fatina-d-oro:music-muted";
const SFX_MUTED_KEY = "fatina-d-oro:sfx-muted";

const readBool = (key: string): boolean => localStorage.getItem(key) === "1";

export class AudioSettingsStore {
  static isMusicMuted(): boolean {
    return readBool(MUSIC_MUTED_KEY);
  }

  static setMusicMuted(muted: boolean): void {
    localStorage.setItem(MUSIC_MUTED_KEY, muted ? "1" : "0");
  }

  static toggleMusicMuted(): boolean {
    const next = !this.isMusicMuted();
    this.setMusicMuted(next);
    return next;
  }

  static isSfxMuted(): boolean {
    return readBool(SFX_MUTED_KEY);
  }

  static setSfxMuted(muted: boolean): void {
    localStorage.setItem(SFX_MUTED_KEY, muted ? "1" : "0");
  }

  static toggleSfxMuted(): boolean {
    const next = !this.isSfxMuted();
    this.setSfxMuted(next);
    return next;
  }
}

