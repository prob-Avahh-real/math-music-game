import type { MathProblem, Difficulty } from '../types';
import { getTypeName, DIFFICULTY_LABELS } from '../utils/problems';

interface ProblemDisplayProps {
  problem: MathProblem;
  answer: string;
  feedback: 'correct' | 'wrong' | null;
}

export default function ProblemDisplay({ problem, answer, feedback }: ProblemDisplayProps) {
  const flashClass = feedback === 'correct'
    ? 'correct-flash'
    : feedback === 'wrong'
    ? 'wrong-flash'
    : '';

  return (
    <div className="w-full mb-6 animate-fade-in-up">
      {/* 题型 & 难度标签 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs px-3 py-1 rounded-full bg-piano-mid/50 text-piano-accent border border-piano-gold/20">
          {getTypeName(problem.type)}
        </span>
        <span className="text-xs px-3 py-1 rounded-full bg-piano-gold/10 text-piano-gold/70">
          {DIFFICULTY_LABELS[problem.difficulty]}
        </span>
      </div>

      {/* 题目 */}
      <div className="bg-piano-dark/50 rounded-2xl p-5 mb-4 border border-piano-gold/10 backdrop-blur-sm">
        <p className="text-lg text-center text-piano-white/90 whitespace-pre-line leading-relaxed font-serif">
          {problem.display}
        </p>
      </div>

      {/* 答案显示区 */}
      <div className={`answer-display ${flashClass} transition-all duration-300`}>
        {answer ? (
          <span className="text-piano-gold">{answer}</span>
        ) : (
          <span className="text-piano-white/20 text-xl font-normal tracking-normal">
            {feedback ? '' : '输入你的答案...'}
          </span>
        )}
      </div>

      {/* 反馈信息 */}
      {feedback === 'correct' && (
        <div className="mt-3 text-center text-green-400 text-sm font-medium animate-fade-in-up">
          ✓ 正确！+{problem.difficulty === 'easy' ? 10 : problem.difficulty === 'medium' ? 25 : problem.difficulty === 'hard' ? 50 : 100} 分
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="mt-3 text-center animate-fade-in-up">
          <p className="text-red-400 text-sm font-medium">
            ✗ 答案是 <span className="font-bold">{problem.answer}</span>
          </p>
          <p className="text-piano-white/40 text-xs mt-1">{problem.explanation}</p>
        </div>
      )}
    </div>
  );
}
