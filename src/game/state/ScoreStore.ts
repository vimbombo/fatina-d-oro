const BEST_SCORE_KEY = "fatina-d-oro:best-score";

export class ScoreStore {
  static getBestScore(): number {
    const raw = localStorage.getItem(BEST_SCORE_KEY);
    return raw ? Number(raw) || 0 : 0;
  }

  static saveBestScore(score: number): number {
    const current = this.getBestScore();
    const best = Math.max(current, score);
    localStorage.setItem(BEST_SCORE_KEY, String(best));
    return best;
  }
}
