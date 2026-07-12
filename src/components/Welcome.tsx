import { useState } from 'react';
import type { Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../utils/problems';
import { initAudio, playEffect, playSequence, NOTE_MAP } from '../utils/audio';

interface WelcomeProps {
  onStart: (difficulty: Difficulty) => void;
  highScore: number;
}

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: '基础算术与简单规律',
  medium: '进阶推理与模运算',
  hard: '质数、数列与方程',
  genius: 'Wolfram 级挑战',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'from-emerald-600 to-teal-700',
  medium: 'from-amber-600 to-orange-700',
  hard: 'from-rose-600 to-red-700',
  genius: 'from-purple-600 to-fuchsia-700',
};

export default function Welcome({ onStart, highScore }: WelcomeProps) {
  const [selected, setSelected] = useState<Difficulty>('easy');

  const handleStart = () => {
    initAudio();
    playEffect('click');
    // 开场旋律
    setTimeout(() => playSequence([0, 2, 4, 7], 0.2), 200);
    setTimeout(() => onStart(selected), 1000);
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'genius'];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in-up">
      {/* 标题 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎵</div>
        <h1 className="text-4xl font-serif font-bold text-piano-gold mb-2 tracking-wide">
          数律华章
        </h1>
        <p className="text-piano-white/50 text-sm tracking-widest">
          MATH &amp; MUSIC
        </p>
        <div className="mt-3 w-24 h-0.5 bg-gradient-to-r from-transparent via-piano-gold/50 to-transparent mx-auto" />
        <p className="mt-3 text-piano-white/40 text-xs">
          数字即音符 · 解题如奏乐
        </p>
      </div>

      {/* 钢琴可视化预览 */}
      <div className="mb-8 flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            className={`
              w-9 h-16 rounded-b-md text-xs font-mono transition-all
              ${i >= 7 ? 'h-14' : 'h-16'}
            `}
            style={{
              background: i === 0 || i === 1 || i === 3 || i === 4 || i === 5 ? '#f8f4e6' : '#1a1a2e',
              color: i === 0 || i === 1 || i === 3 || i === 4 || i === 5 ? '#1a1a2e' : '#f8f4e6',
              border: '1px solid rgba(212,165,116,0.3)',
            }}
            onClick={() => {
              initAudio();
              playEffect('digit', i);
            }}
          >
            <span className="block mt-1">{i}</span>
            <span className="block text-[8px] opacity-50">{NOTE_MAP[i].noteName}</span>
          </button>
        ))}
      </div>

      {/* 难度选择 */}
      <div className="w-full max-w-xs space-y-2 mb-8">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => {
              setSelected(d);
              playEffect('click');
            }}
            className={`
              w-full py-3 px-4 rounded-xl text-left transition-all duration-200
              bg-gradient-to-r ${DIFFICULTY_COLORS[d]}
              ${selected === d
                ? 'ring-2 ring-piano-gold scale-[1.03] shadow-lg shadow-piano-gold/20'
                : 'opacity-50 hover:opacity-80 scale-100'
              }
            `}
          >
            <div className="font-bold">{DIFFICULTY_LABELS[d]}</div>
            <div className="text-xs opacity-70">{DIFFICULTY_DESC[d]}</div>
          </button>
        ))}
      </div>

      {/* 开始按钮 */}
      <button
        onClick={handleStart}
        className="px-12 py-4 rounded-full bg-piano-gold text-piano-black font-bold text-xl
                   hover:bg-piano-accent transition-all duration-300
                   shadow-lg shadow-piano-gold/30 hover:shadow-piano-gold/50
                   active:scale-95 animate-pulse-gold"
      >
        开始演奏
      </button>

      {/* 最高分 */}
      {highScore > 0 && (
        <p className="mt-6 text-piano-white/30 text-sm">
          最高分: {highScore}
        </p>
      )}
    </div>
  );
}
