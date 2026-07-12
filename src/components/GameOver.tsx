import type { GameStats, Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../utils/problems';
import { initAudio, playEffect, playSequence } from '../utils/audio';

interface GameOverProps {
  stats: GameStats;
  difficulty: Difficulty;
  problemCount: number;
  maxProblems: number;
  onRestart: (difficulty: Difficulty) => void;
  onHome: () => void;
}

export default function GameOver({
  stats,
  difficulty,
  problemCount,
  maxProblems,
  onRestart,
  onHome,
}: GameOverProps) {
  const accuracy = problemCount > 0
    ? Math.round((stats.correct / Math.max(stats.totalPlayed - (maxProblems - problemCount), 1)) * 100)
    : 0;

  const isWin = problemCount >= maxProblems;
  const isHighScore = stats.score >= stats.highScore && stats.score > 0;

  const handleRestart = (diff: Difficulty) => {
    initAudio();
    playEffect('click');
    setTimeout(() => {
      playSequence([0, 2, 4, 5, 7], 0.15);
      onRestart(diff);
    }, 400);
  };

  const handleHome = () => {
    initAudio();
    playEffect('click');
    onHome();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in-up">
      {/* 图标 */}
      <div className="text-7xl mb-6">
        {isWin ? '🏆' : accuracy >= 70 ? '🎹' : '💫'}
      </div>

      {/* 标题 */}
      <h2 className="text-3xl font-serif font-bold text-piano-gold mb-2">
        {isWin ? '演奏完成！' : '游戏结束'}
      </h2>
      <p className="text-piano-white/50 text-sm mb-8">
        {isWin
          ? '你完成了一首数学的乐章'
          : accuracy >= 70
          ? '不错的表现，继续加油'
          : '再接再厉，数学之美在等待'}
      </p>

      {/* 统计面板 */}
      <div className="w-full max-w-xs bg-piano-dark/50 rounded-2xl p-5 border border-piano-gold/10 mb-6 space-y-3">
        {/* 分数 */}
        <div className="flex justify-between items-center">
          <span className="text-piano-white/50 text-sm">得分</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-2xl text-piano-gold">{stats.score}</span>
            {isHighScore && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 animate-pulse">
                新纪录！
              </span>
            )}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-piano-white/5" />

        {/* 详细统计 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatItem label="正确率" value={`${accuracy}%`} />
          <StatItem label="最佳连击" value={`${stats.bestStreak}x`} />
          <StatItem label="答对" value={`${stats.correct}`} />
          <StatItem label="难度" value={DIFFICULTY_LABELS[difficulty]} />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={() => handleRestart(difficulty)}
          className="w-full py-4 rounded-xl bg-piano-gold text-piano-black font-bold text-lg
                     hover:bg-piano-accent transition-all duration-200
                     shadow-lg shadow-piano-gold/20 active:scale-95"
        >
          再来一局 ({DIFFICULTY_LABELS[difficulty]})
        </button>

        {/* 难度选择 */}
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard', 'genius'] as Difficulty[]).filter(d => d !== difficulty).map(d => (
            <button
              key={d}
              onClick={() => handleRestart(d)}
              className="flex-1 py-2 rounded-lg bg-piano-mid/30 text-piano-white/60 text-xs
                         hover:bg-piano-mid/50 hover:text-piano-white transition-all border border-piano-gold/10"
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        <button
          onClick={handleHome}
          className="w-full py-3 rounded-xl text-piano-white/40 text-sm
                     hover:text-piano-white/70 transition-all"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-piano-white/30 text-xs mb-0.5">{label}</div>
      <div className="font-mono font-bold text-piano-white/80">{value}</div>
    </div>
  );
}
