import { useState, useCallback, useEffect } from 'react';
import type { GamePhase, Difficulty, GameStats, MathProblem } from './types';
import { generateProblem, DIFFICULTY_POINTS, DIFFICULTY_LABELS } from './utils/problems';
import { loadStats, recordAnswer } from './utils/storage';
import { initAudio, playEffect, playSequence } from './utils/audio';
import Welcome from './components/Welcome';
import ProblemDisplay from './components/ProblemDisplay';
import NumberPad from './components/NumberPad';
import ScoreBoard from './components/ScoreBoard';
import GameOver from './components/GameOver';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('welcome');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [problemCount, setProblemCount] = useState(0);
  const maxProblems = 15;

  // 新题目
  const newProblem = useCallback((diff: Difficulty) => {
    const p = generateProblem(diff);
    setProblem(p);
    setAnswer('');
    setFeedback(null);
    // 演奏题目数字
    setTimeout(() => playSequence(p.digits, 0.15), 300);
  }, []);

  // 开始游戏
  const startGame = useCallback((diff: Difficulty) => {
    initAudio();
    setDifficulty(diff);
    setPhase('playing');
    setProblemCount(0);
    setFeedback(null);
    const freshStats = loadStats();
    freshStats.streak = 0;
    setStats(freshStats);
    newProblem(diff);
  }, [newProblem]);

  // 输入数字
  const handleDigit = useCallback((digit: number) => {
    if (feedback) return;
    playEffect('digit', digit);
    setAnswer(prev => {
      // 防止过长
      if (prev.length >= 8) return prev;
      // 允许负号
      if (digit === -1) {
        return prev === '' ? '-' : prev;
      }
      return prev + String(digit);
    });
  }, [feedback]);

  // 删除
  const handleDelete = useCallback(() => {
    if (feedback) return;
    playEffect('click');
    setAnswer(prev => prev.slice(0, -1));
  }, [feedback]);

  // 提交答案
  const handleSubmit = useCallback(() => {
    if (!problem || feedback || answer === '' || answer === '-') return;

    const isCorrect = parseInt(answer, 10) === problem.answer;

    if (isCorrect) {
      setFeedback('correct');
      playEffect('correct');
      const points = DIFFICULTY_POINTS[difficulty];
      const newStats = recordAnswer(stats, difficulty, true, points);
      setStats(newStats);

      const nextCount = problemCount + 1;

      // 答案回显
      setTimeout(() => {
        if (nextCount >= maxProblems) {
          playEffect('gameover');
          setPhase('gameover');
        } else {
          setProblemCount(nextCount);
          // 答对足够多升级
          const newDiff = newStats.streak >= 5 && newStats.streak % 5 === 0
            ? upgradeDifficulty(difficulty)
            : difficulty;
          if (newDiff !== difficulty) {
            setDifficulty(newDiff);
            playEffect('levelup');
          }
          setTimeout(() => newProblem(newDiff), 600);
        }
      }, 1200);
    } else {
      setFeedback('wrong');
      playEffect('wrong');
      const newStats = recordAnswer(stats, difficulty, false, 0);
      setStats(newStats);

      setTimeout(() => {
        setPhase('gameover');
        playEffect('gameover');
      }, 1500);
    }
  }, [problem, feedback, answer, difficulty, stats, problemCount, newProblem]);

  // 键盘事件
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === '-') {
        handleDigit(-1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleDigit, handleDelete, handleSubmit]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-piano-black via-piano-dark to-piano-black">
      {/* 顶部五线谱装饰 */}
      <div className="relative h-16 overflow-hidden opacity-20 pointer-events-none">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="staff-line" style={{ top: `${8 + i * 10}px` }} />
        ))}
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 pb-8 max-w-lg mx-auto w-full">
        {phase === 'welcome' && (
          <Welcome onStart={startGame} highScore={stats.highScore} />
        )}

        {(phase === 'playing' || phase === 'correct' || phase === 'wrong') && problem && (
          <>
            <ScoreBoard
              stats={stats}
              difficulty={difficulty}
              problemCount={problemCount}
              maxProblems={maxProblems}
            />
            <ProblemDisplay
              problem={problem}
              answer={answer}
              feedback={feedback}
            />
            <NumberPad
              onDigit={handleDigit}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              disabled={!!feedback}
              answer={answer}
            />
          </>
        )}

        {phase === 'gameover' && (
          <GameOver
            stats={stats}
            difficulty={difficulty}
            problemCount={problemCount}
            maxProblems={maxProblems}
            onRestart={(diff) => startGame(diff)}
            onHome={() => setPhase('welcome')}
          />
        )}
      </div>
    </div>
  );
}

function upgradeDifficulty(d: Difficulty): Difficulty {
  const order: Difficulty[] = ['easy', 'medium', 'hard', 'genius'];
  const idx = order.indexOf(d);
  return idx < order.length - 1 ? order[idx + 1] : d;
}
