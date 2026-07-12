import type { GameStats, Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../utils/problems';

interface ScoreBoardProps {
  stats: GameStats;
  difficulty: Difficulty;
  problemCount: number;
  maxProblems: number;
}

export default function ScoreBoard({ stats, difficulty, problemCount, maxProblems }: ScoreBoardProps) {
  return (
    <div className="w-full mb-4 pt-2">
      {/* 进度条 */}
      <div className="w-full h-1.5 bg-piano-mid/30 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-piano-gold to-piano-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(problemCount / maxProblems) * 100}%` }}
        />
      </div>

      {/* 统计行 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* 分数 */}
          <div className="flex items-center gap-1">
            <span className="text-piano-gold text-lg">★</span>
            <span className="font-mono font-bold text-piano-gold">{stats.score}</span>
          </div>

          {/* 连击 */}
          {stats.streak > 1 && (
            <div className="flex items-center gap-1 animate-fade-in-up">
              <span className="text-orange-400 text-sm">🔥</span>
              <span className="font-mono text-orange-400 font-bold">{stats.streak}x</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-piano-white/50">
          {/* 进度 */}
          <span className="text-xs font-mono">
            {problemCount}/{maxProblems}
          </span>

          {/* 难度 */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-piano-mid/30 border border-piano-gold/10">
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>
      </div>
    </div>
  );
}
