/* ===== 音频引擎: 数字→音符映射 & 音效播放 =====
 *
 * C大调基准: 0=C4, 1=D4, 2=E4, 3=F4, 4=G4, 5=A4, 6=B4
 *           7=C5(高八度), 8=D5(高一度), 9=E5(高二度)
 */

import type { NoteMapping, SoundEffect } from '../types';

// ── 频率表 (A4 = 440Hz) ──
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;

/** 数字→音符映射表 */
export const NOTE_MAP: Record<number, NoteMapping> = {
  0: { digit: 0, noteName: 'C4',  frequency: C4, octave: 4, label: 'do' },
  1: { digit: 1, noteName: 'D4',  frequency: D4, octave: 4, label: 're' },
  2: { digit: 2, noteName: 'E4',  frequency: E4, octave: 4, label: 'mi' },
  3: { digit: 3, noteName: 'F4',  frequency: F4, octave: 4, label: 'fa' },
  4: { digit: 4, noteName: 'G4',  frequency: G4, octave: 4, label: 'sol' },
  5: { digit: 5, noteName: 'A4',  frequency: A4, octave: 4, label: 'la' },
  6: { digit: 6, noteName: 'B4',  frequency: B4, octave: 4, label: 'si' },
  7: { digit: 7, noteName: 'C5',  frequency: C5, octave: 5, label: 'do↑' },
  8: { digit: 8, noteName: 'D5',  frequency: D5, octave: 5, label: 're↑' },
  9: { digit: 9, noteName: 'E5',  frequency: E5, octave: 5, label: 'mi↑' },
};

/** 音符名称中文 */
export const NOTE_NAMES_CN = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do↑', 'Re↑', 'Mi↑'];

// ── 单例 AudioContext ──
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterGain(): GainNode {
  getCtx();
  return masterGain!;
}

/** 播放单个频率 */
function playTone(
  freq: number,
  startTime: number,
  duration: number,
  gainVal: number = 0.3,
  type: OscillatorType = 'sine'
): void {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // ADSR envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);  // attack
  gain.gain.linearRampToValueAtTime(gainVal * 0.7, startTime + duration * 0.6); // decay
  gain.gain.linearRampToValueAtTime(0, startTime + duration);    // release

  osc.connect(gain);
  gain.connect(getMasterGain());

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ── 公开 API ──

/** 播放一个数字对应的音符 */
export function playDigit(digit: number): void {
  const note = NOTE_MAP[digit];
  if (!note) return;
  const ctx = getCtx();
  playTone(note.frequency, ctx.currentTime, 0.3, 0.25, 'sine');
  // 叠加泛音
  playTone(note.frequency * 2, ctx.currentTime, 0.2, 0.06, 'sine');
}

/** 播放一串数字 (旋律) */
export function playSequence(digits: number[], tempo: number = 0.18): void {
  const ctx = getCtx();
  digits.forEach((d, i) => {
    const note = NOTE_MAP[d];
    if (!note) return;
    const t = ctx.currentTime + i * tempo;
    playTone(note.frequency, t, tempo * 0.9, 0.22, 'triangle');
  });
}

/** 答题正确: 上行琶音 C-E-G-C' */
export function playCorrect(): void {
  const ctx = getCtx();
  const notes = [C4, E4, G4, C5];
  notes.forEach((freq, i) => {
    playTone(freq, ctx.currentTime + i * 0.12, 0.4, 0.25, 'sine');
    playTone(freq * 2, ctx.currentTime + i * 0.12, 0.3, 0.06, 'sine');
  });
  // 结尾和弦
  const tEnd = ctx.currentTime + 0.48;
  [C4, E4, G4, C5].forEach(freq => {
    playTone(freq, tEnd, 0.6, 0.15, 'triangle');
  });
}

/** 答题错误: 下行二度 */
export function playWrong(): void {
  const ctx = getCtx();
  playTone(E4, ctx.currentTime, 0.25, 0.2, 'sawtooth');
  playTone(D4, ctx.currentTime + 0.18, 0.25, 0.2, 'sawtooth');
  playTone(C4, ctx.currentTime + 0.36, 0.4, 0.15, 'sawtooth');
}

/** 升级 */
export function playLevelUp(): void {
  const ctx = getCtx();
  const scale = [C4, D4, E4, F4, G4, A4, B4, C5];
  scale.forEach((freq, i) => {
    playTone(freq, ctx.currentTime + i * 0.08, 0.2, 0.18, 'sine');
  });
}

/** 游戏结束 */
export function playGameOver(): void {
  const ctx = getCtx();
  const descend = [C5, B4, A4, G4, F4, E4, D4, C4];
  descend.forEach((freq, i) => {
    playTone(freq, ctx.currentTime + i * 0.15, 0.5, 0.12, 'triangle');
  });
  // 终止和弦
  playTone(C4, ctx.currentTime + 1.2, 0.8, 0.1, 'sawtooth');
}

/** 点击 */
export function playClick(): void {
  const ctx = getCtx();
  playTone(880, ctx.currentTime, 0.05, 0.1, 'sine');
}

/** 播放指定音效 */
export function playEffect(effect: SoundEffect, digit?: number): void {
  switch (effect) {
    case 'digit':
      if (digit !== undefined) playDigit(digit);
      break;
    case 'correct':
      playCorrect();
      break;
    case 'wrong':
      playWrong();
      break;
    case 'levelup':
      playLevelUp();
      break;
    case 'click':
      playClick();
      break;
    case 'gameover':
      playGameOver();
      break;
  }
}

/** 设置主音量 0.0 - 1.0 */
export function setVolume(v: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, v));
  }
}

/** 初始化音频上下文 (需用户交互后调用) */
export function initAudio(): void {
  getCtx();
}
