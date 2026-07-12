/* ===== 核心类型定义 ===== */

/** 数字到音符的映射 (C大调) */
export interface NoteMapping {
  digit: number;
  noteName: string;
  frequency: number;
  octave: number;
  label: string; // 中文音名
}

/** 数学题目 */
export interface MathProblem {
  id: string;
  type: ProblemType;
  difficulty: Difficulty;
  display: string;       // 显示的题目文本
  answer: number;         // 正确答案
  hint?: string;
  explanation: string;    // 解题思路
  digits: number[];       // 题目中的数字序列(用于演奏)
}

/** 题目类型 */
export type ProblemType =
  | 'arithmetic'
  | 'sequence'
  | 'missing_digit'
  | 'modular'
  | 'digit_sum'
  | 'prime'
  | 'factor'
  | 'equation'
  | 'pattern'
  | 'logic';

/** 难度 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'genius';

/** 游戏状态 */
export type GamePhase =
  | 'welcome'
  | 'playing'
  | 'correct'
  | 'wrong'
  | 'gameover';

/** 游戏统计 */
export interface GameStats {
  totalPlayed: number;
  correct: number;
  streak: number;
  bestStreak: number;
  score: number;
  highScore: number;
  byDifficulty: Record<Difficulty, { played: number; correct: number }>;
}

/** 音效类型 */
export type SoundEffect =
  | 'digit'
  | 'correct'
  | 'wrong'
  | 'levelup'
  | 'click'
  | 'gameover';
