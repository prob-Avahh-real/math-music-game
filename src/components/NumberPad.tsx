import { useCallback, useRef, useState } from 'react';
import { NOTE_MAP, NOTE_NAMES_CN, playDigit } from '../utils/audio';

interface NumberPadProps {
  onDigit: (digit: number) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
  answer: string;
}

export default function NumberPad({ onDigit, onDelete, onSubmit, disabled, answer }: NumberPadProps) {
  const [pressedKey, setPressedKey] = useState<number | null>(null);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const handlePress = useCallback((digit: number) => {
    if (disabled) return;
    setPressedKey(digit);
    onDigit(digit);
    if (timers.current.has(digit)) {
      clearTimeout(timers.current.get(digit));
    }
    timers.current.set(digit, setTimeout(() => setPressedKey(null), 150));
  }, [disabled, onDigit]);

  const handleDelete = useCallback(() => {
    if (disabled) return;
    onDelete();
  }, [disabled, onDelete]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit();
  }, [disabled, onSubmit]);

  const canSubmit = answer !== '' && answer !== '-' && !disabled;

  // 钢琴键布局: 上排是白键(大的), 下排紧凑
  const topRow = [7, 8, 9];
  const midRow = [4, 5, 6];
  const botRow = [1, 2, 3];
  const zeroRow = [0];

  return (
    <div className="w-full max-w-sm mt-2">
      {/* 键盘 */}
      <div className="space-y-2">
        {/* 7 8 9 */}
        <div className="flex gap-2">
          {topRow.map(d => (
            <KeyButton
              key={d}
              digit={d}
              pressed={pressedKey === d}
              onPress={handlePress}
              disabled={disabled}
            />
          ))}
        </div>
        {/* 4 5 6 */}
        <div className="flex gap-2">
          {midRow.map(d => (
            <KeyButton
              key={d}
              digit={d}
              pressed={pressedKey === d}
              onPress={handlePress}
              disabled={disabled}
            />
          ))}
        </div>
        {/* 1 2 3 */}
        <div className="flex gap-2">
          {botRow.map(d => (
            <KeyButton
              key={d}
              digit={d}
              pressed={pressedKey === d}
              onPress={handlePress}
              disabled={disabled}
            />
          ))}
        </div>
        {/* 0, 删除, 提交 */}
        <div className="flex gap-2">
          <KeyButton
            digit={0}
            pressed={pressedKey === 0}
            onPress={handlePress}
            disabled={disabled}
          />
          <button
            onClick={handleDelete}
            disabled={disabled}
            className="piano-key flex-1 py-4 text-lg text-piano-white/70
                       disabled:opacity-30 flex items-center justify-center"
          >
            ⌫
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              flex-1 py-4 rounded-lg font-bold text-lg transition-all duration-200
              ${canSubmit
                ? 'bg-piano-gold text-piano-black shadow-lg shadow-piano-gold/30 hover:bg-piano-accent active:scale-95'
                : 'bg-piano-gold/20 text-piano-gold/30 cursor-not-allowed'
              }
            `}
          >
            确定
          </button>
        </div>
      </div>

      {/* 提示 */}
      <p className="text-center text-piano-white/15 text-[10px] mt-3">
        键盘快捷键: 0-9 输入 · Enter 确定 · Backspace 删除
      </p>
    </div>
  );
}

/* 单个琴键 */
function KeyButton({
  digit,
  pressed,
  onPress,
  disabled,
}: {
  digit: number;
  pressed: boolean;
  onPress: (d: number) => void;
  disabled: boolean;
}) {
  const note = NOTE_MAP[digit];

  return (
    <button
      onClick={() => onPress(digit)}
      disabled={disabled}
      className={`
        piano-key flex-1 py-4 flex flex-col items-center justify-center
        disabled:opacity-30
        ${pressed ? 'pressed' : ''}
      `}
    >
      <span className="text-xl">{digit}</span>
      <span className="text-[9px] opacity-40 mt-0.5">{note.noteName}</span>
      <span className="text-[9px] opacity-30">{note.label}</span>
    </button>
  );
}

// 保留 unused import 以防未来引用
export { NOTE_NAMES_CN };
