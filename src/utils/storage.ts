/* ===== LocalStorage 封装 ===== */

import type { GameStats, Difficulty } from '../types';

const STATS_KEY = 'math_music_stats';
const HIGH_SCORE_KEY = 'math_music_high';

const defaultStats: GameStats = {
  totalPlayed: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  score: 0,
  highScore: 0,
  byDifficulty: {
    easy:    { played: 0, correct: 0 },
    medium:  { played: 0, correct: 0 },
    hard:    { played: 0, correct: 0 },
    genius:  { played: 0, correct: 0 },
  },
};

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultStats, ...parsed, byDifficulty: { ...defaultStats.byDifficulty, ...parsed.byDifficulty } };
    }
  } catch { /* ignore */ }
  return { ...defaultStats, byDifficulty: { ...defaultStats.byDifficulty } };
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}

export function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch { /* ignore */ }
}

/** 记录一次答题 */
export function recordAnswer(
  stats: GameStats,
  difficulty: Difficulty,
  correct: boolean,
  points: number,
): GameStats {
  const updated: GameStats = {
    ...stats,
    totalPlayed: stats.totalPlayed + 1,
    correct: stats.correct + (correct ? 1 : 0),
    streak: correct ? stats.streak + 1 : 0,
    bestStreak: correct ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
    score: stats.score + (correct ? points + Math.floor(stats.streak / 3) * 5 : 0),
    byDifficulty: {
      ...stats.byDifficulty,
      [difficulty]: {
        played: stats.byDifficulty[difficulty].played + 1,
        correct: stats.byDifficulty[difficulty].correct + (correct ? 1 : 0),
      },
    },
  };

  if (updated.score > updated.highScore) {
    updated.highScore = updated.score;
    saveHighScore(updated.score);
  }

  saveStats(updated);
  return updated;
}
