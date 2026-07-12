/* ===== 数学题库生成器 — Wolfram 风格 =====
 *
 * 10 种题型 × 4 个难度等级
 * 每道题的 digits 字段记录题目中出现的数字序列，用于入场旋律演奏
 */

import type { MathProblem, ProblemType, Difficulty } from '../types';

let _idCounter = 0;
function uid(): string {
  return `p_${Date.now()}_${++_idCounter}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 从整数中提取数字列表 */
function digitsOf(n: number): number[] {
  return String(Math.abs(Math.round(n)))
    .split('')
    .map(ch => parseInt(ch, 10));
}

// ──────────────── 题型实现 ────────────────

function genArithmetic(difficulty: Difficulty): MathProblem {
  const ranges: Record<Difficulty, [number, number]> = {
    easy:   [1, 30],
    medium: [1, 100],
    hard:   [10, 500],
    genius: [50, 9999],
  };
  const [lo, hi] = ranges[difficulty];
  const ops = difficulty === 'easy' ? ['+', '-'] : difficulty === 'medium' ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
  const op = ops[randInt(0, ops.length - 1)];

  let a: number, b: number, answer: number, display: string;

  switch (op) {
    case '+':
      a = randInt(lo, hi);
      b = randInt(lo, hi);
      answer = a + b;
      display = `${a} + ${b} = ?`;
      break;
    case '-':
      a = randInt(lo, hi);
      b = randInt(lo, Math.min(a, hi));
      answer = a - b;
      display = `${a} − ${b} = ?`;
      break;
    case '×':
      a = randInt(lo, Math.min(hi, difficulty === 'genius' ? 200 : 50));
      b = randInt(2, difficulty === 'genius' ? 99 : 12);
      answer = a * b;
      display = `${a} × ${b} = ?`;
      break;
    case '÷':
      b = randInt(2, difficulty === 'genius' ? 50 : 12);
      answer = randInt(1, difficulty === 'genius' ? 200 : 30);
      a = b * answer;
      display = `${a} ÷ ${b} = ?`;
      break;
    default:
      a = randInt(lo, hi);
      b = randInt(lo, hi);
      answer = a + b;
      display = `${a} + ${b} = ?`;
  }

  return {
    id: uid(), type: 'arithmetic', difficulty,
    display, answer,
    explanation: `直接计算: ${display.replace('= ?', `= ${answer}`)}`,
    digits: [...digitsOf(a), ...digitsOf(b)],
  };
}

function genSequence(difficulty: Difficulty): MathProblem {
  const patterns = [
    // 等差数列
    { easy: [1,3,5,7], medium: [2,7,12,17], hard: [11,23,35,47], genius: [1,8,15,22,29,36] },
    // 等比数列
    { easy: [1,2,4,8], medium: [3,9,27,81], hard: [2,6,18,54], genius: [1,4,16,64,256] },
    // 斐波那契
    { easy: [1,1,2,3,5], medium: [2,3,5,8,13], hard: [1,2,3,5,8,13], genius: [5,8,13,21,34,55] },
    // 平方数
    { easy: [1,4,9,16], medium: [4,9,16,25], hard: [25,36,49,64], genius: [121,144,169,196] },
    // 阶乘
    { medium: [1,2,6,24], hard: [1,1,2,6,24], genius: [2,6,24,120,720] },
    // n²-n
    { hard: [0,2,6,12,20], genius: [2,6,12,20,30,42] },
    // 交错
    { genius: [1,2,4,7,11,16] },
  ];

  // Filter by difficulty
  const available = patterns.filter(p => p[difficulty] !== undefined);
  const chosen = available[randInt(0, available.length - 1)];
  const seq = chosen[difficulty]!;
  const answer = seq[seq.length - 1];

  const display = seq.slice(0, -1).join(', ') + ', ?';

  return {
    id: uid(), type: 'sequence', difficulty,
    display,
    answer,
    explanation: `数列规律: 观察前几项的模式，下一项是 ${answer}`,
    digits: digitsOf(answer),
  };
}

function genMissingDigit(difficulty: Difficulty): MathProblem {
  const ranges: Record<Difficulty, number> = {
    easy: 20, medium: 100, hard: 500, genius: 2000,
  };
  const max = ranges[difficulty];
  const a = randInt(10, max);
  const b = randInt(10, max);
  const op = randInt(0, 1) === 0 ? '+' : '−';
  const result = op === '+' ? a + b : a - b;

  // 把 a 的某一位替换成 ?
  const aStr = String(a);
  const pos = randInt(0, aStr.length - 1);
  const answer = parseInt(aStr[pos], 10);
  const masked = aStr.slice(0, pos) + '?' + aStr.slice(pos + 1);

  const display = op === '+'
    ? `${masked} + ${b} = ${result}`
    : `${masked} − ${b} = ${result}`;

  const realOp = op === '+' ? '+' : '−';

  return {
    id: uid(), type: 'missing_digit', difficulty,
    display,
    answer,
    explanation: `${masked} ${realOp} ${b} = ${result}，反推可知? = ${answer}`,
    digits: [...digitsOf(a), ...digitsOf(b), ...digitsOf(result)],
  };
}

function genModular(difficulty: Difficulty): MathProblem {
  const mods: Record<Difficulty, number> = {
    easy: 7, medium: 12, hard: 31, genius: 97,
  };
  const maxVal: Record<Difficulty, number> = {
    easy: 30, medium: 100, hard: 200, genius: 1000,
  };
  const mod = mods[difficulty];
  const a = randInt(10, maxVal[difficulty]);
  const answer = a % mod;

  return {
    id: uid(), type: 'modular', difficulty,
    display: `${a} mod ${mod} = ?`,
    answer,
    explanation: `${a} ÷ ${mod} = ${Math.floor(a / mod)} 余 ${answer}`,
    digits: [...digitsOf(a), ...digitsOf(mod)],
  };
}

function genDigitSum(difficulty: Difficulty): MathProblem {
  const len: Record<Difficulty, [number, number]> = {
    easy: [2, 3], medium: [3, 4], hard: [4, 5], genius: [5, 8],
  };
  const [minLen, maxLen] = len[difficulty];
  const numLen = randInt(minLen, maxLen);
  let num = '';
  for (let i = 0; i < numLen; i++) {
    num += randInt(i === 0 ? 1 : 0, 9).toString();
  }
  const numInt = parseInt(num, 10);
  const answer = digitsOf(numInt).reduce((a, b) => a + b, 0);

  return {
    id: uid(), type: 'digit_sum', difficulty,
    display: `${num} 的各位数字之和 = ?`,
    answer,
    explanation: digitsOf(numInt).join(' + ') + ` = ${answer}`,
    digits: digitsOf(numInt),
  };
}

function genPrime(difficulty: Difficulty): MathProblem {
  const maxCheck: Record<Difficulty, number> = {
    easy: 30, medium: 100, hard: 500, genius: 2000,
  };
  const maxN = maxCheck[difficulty];

  // 第 N 个质数 或 范围内最小/最大质数 或 质因数个数
  const variant = randInt(0, 2);

  if (variant === 0) {
    // "找出第 n 个质数"
    const n = randInt(2, difficulty === 'genius' ? 30 : 10);
    const primes = sieve(maxN);
    const answer = primes[n - 1];
    return {
      id: uid(), type: 'prime', difficulty,
      display: `第 ${n} 个质数是？`,
      answer,
      explanation: `前 ${n} 个质数: ${primes.slice(0, n).join(', ')}。第 ${n} 个是 ${answer}`,
      digits: [n],
    };
  } else if (variant === 1) {
    // "X 是质数吗？" (二进制: 是=1, 不是=0)
    const n = randInt(2, maxN);
    const answer = isPrime(n) ? 1 : 0;
    return {
      id: uid(), type: 'prime', difficulty,
      display: `${n} 是质数吗？(是=1, 否=0)`,
      answer,
      explanation: isPrime(n) ? `${n} 是质数` : `${n} = ${factorizeStr(n)}，不是质数`,
      digits: digitsOf(n),
    };
  } else {
    // "X 的质因数个数"
    const n = randInt(6, maxN);
    const factors = factorize(n);
    const answer = factors.length;
    return {
      id: uid(), type: 'prime', difficulty,
      display: `${n} 有几个质因数？`,
      answer,
      explanation: `${n} = ${factors.join(' × ')}，共 ${answer} 个`,
      digits: digitsOf(n),
    };
  }
}

function genFactor(difficulty: Difficulty): MathProblem {
  const maxN: Record<Difficulty, number> = {
    easy: 36, medium: 144, hard: 500, genius: 2000,
  };
  const n = randInt(6, maxN[difficulty]);
  const fact = getFactors(n);
  // "X 有几个正整数因数？"
  const answer = fact.length;

  return {
    id: uid(), type: 'factor', difficulty,
    display: `${n} 有几个正因数？`,
    answer,
    explanation: `${n} 的因数: ${fact.join(', ')}，共 ${answer} 个`,
    digits: digitsOf(n),
  };
}

function genEquation(difficulty: Difficulty): MathProblem {
  const ranges: Record<Difficulty, [number, number]> = {
    easy: [1, 20], medium: [1, 50], hard: [1, 100], genius: [1, 500],
  };
  const [lo, hi] = ranges[difficulty];
  const x = randInt(lo, hi);
  const variant = randInt(0, 3);

  let display: string, answer: number;

  switch (variant) {
    case 0: { // 2x + a = b
      const a = randInt(lo, hi);
      const b = 2 * x + a;
      display = `2x + ${a} = ${b}，x = ?`;
      answer = x;
      break;
    }
    case 1: { // 3x - a = b
      const a = randInt(lo, hi);
      const b = 3 * x - a;
      display = `3x − ${a} = ${b}，x = ?`;
      answer = x;
      break;
    }
    case 2: { // x² = n
      const n = x * x;
      display = `x² = ${n}，x = ?`;
      answer = x;
      break;
    }
    default: { // x/a = b
      const a = randInt(2, difficulty === 'genius' ? 20 : 10);
      const b = x;
      const n = a * b;
      display = `x ÷ ${a} = ${b}，x = ?`;
      answer = n;
      break;
    }
  }

  return {
    id: uid(), type: 'equation', difficulty,
    display, answer,
    explanation: display.replace('= ?', `= ${answer}`),
    digits: digitsOf(answer),
  };
}

function genPattern(difficulty: Difficulty): MathProblem {
  const patterns: [string, number, string][] = [
    ['1 + 1 = 2\n2 + 2 = 4\n4 + 4 = 8\n8 + 8 = ?', 16, '每次翻倍'],
    ['1 × 1 = 1\n11 × 11 = 121\n111 × 111 = 12321\n1111 × 1111 = ?', 1234321, '回文数模式'],
    ['2¹ = 2\n2² = 4\n2³ = 8\n2⁴ = ?', 16, '2的幂'],
    ['1³ = 1\n2³ = 8\n3³ = 27\n4³ = ?', 64, '立方数'],
    ['0! = 1\n1! = 1\n2! = 2\n3! = 6\n4! = ?', 24, '阶乘'],
  ];

  const available = patterns.slice(0, difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5);
  const chosen = available[randInt(0, available.length - 1)];
  const [display, answer, explanation] = chosen;

  return {
    id: uid(), type: 'pattern', difficulty,
    display, answer, explanation,
    digits: digitsOf(answer),
  };
}

function genLogic(difficulty: Difficulty): MathProblem {
  const puzzles: [string, number, string][] = [
    // 鸡兔同笼
    ['鸡兔同笼，头共10个，脚共28只。鸡有几只？', 6, '设鸡x只，兔(10-x)只。2x+4(10-x)=28，解得x=6'],
    ['鸡兔同笼，头共15个，脚共42只。兔有几只？', 6, '设兔x只，鸡(15-x)只。4x+2(15-x)=42，解得x=6'],
    // 数字谜
    ['一个两位数，十位是个位的2倍，且两个数字和为9。这个数是？', 63, '设个位x，十位2x，2x+x=9，x=3，数是63'],
    ['一个两位数，十位比个位大3，交换后比原数小27。原数是？', 63, '设十位a个位b，a=b+3，(10b+a)=(10a+b)-27，解得a=6,b=3'],
    // 年龄
    ['爸爸今年40岁，儿子10岁。几年后爸爸年龄是儿子的2倍？', 20, '设x年后，(40+x)=2(10+x)，x=20'],
    ['小明今年12岁，爷爷72岁。几年前爷爷年龄是小明的7倍？', 2, '设x年前，(72-x)=7(12-x)，x=2'],
    // 数字推理
    ['找规律: 1, 4, 9, 16, 25, ?', 36, '平方数: 1²,2²,3²,4²,5²,6²'],
    ['找规律: 2, 3, 5, 7, 11, ?', 13, '连续质数'],
  ];

  const start = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 0 : difficulty === 'hard' ? 2 : 4;
  const end = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : difficulty === 'hard' ? 7 : 8;
  const chosen = puzzles[randInt(start, end - 1)];

  return {
    id: uid(), type: 'logic', difficulty,
    display: chosen[0], answer: chosen[1], explanation: chosen[2],
    digits: digitsOf(chosen[1]),
  };
}

// ──────────────── 辅助函数 ────────────────

function sieve(n: number): number[] {
  const isPrime = Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) isPrime[j] = false;
    }
  }
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
  }
  return primes;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function factorize(n: number): number[] {
  const factors: number[] = [];
  let m = n;
  for (let i = 2; i * i <= m; i++) {
    while (m % i === 0) {
      factors.push(i);
      m /= i;
    }
  }
  if (m > 1) factors.push(m);
  return factors;
}

function factorizeStr(n: number): string {
  return factorize(n).join(' × ');
}

function getFactors(n: number): number[] {
  const f: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      f.push(i);
      if (i !== n / i) f.push(n / i);
    }
  }
  return f.sort((a, b) => a - b);
}

// ──────────────── 公开 API ────────────────

const GENERATORS: Record<ProblemType, (d: Difficulty) => MathProblem> = {
  arithmetic:     genArithmetic,
  sequence:       genSequence,
  missing_digit:  genMissingDigit,
  modular:        genModular,
  digit_sum:      genDigitSum,
  prime:          genPrime,
  factor:         genFactor,
  equation:       genEquation,
  pattern:        genPattern,
  logic:          genLogic,
};

const TYPE_NAMES_CN: Record<ProblemType, string> = {
  arithmetic:     '算数',
  sequence:       '数列',
  missing_digit:  '缺位',
  modular:        '模运算',
  digit_sum:      '数位和',
  prime:          '质数',
  factor:         '因数',
  equation:       '方程',
  pattern:        '模式',
  logic:          '逻辑',
};

export function getTypeName(type: ProblemType): string {
  return TYPE_NAMES_CN[type];
}

/** 按难度随机生成一道题 */
export function generateProblem(difficulty: Difficulty): MathProblem {
  // 难度越低，越偏向基础题型
  const typePool: Record<Difficulty, ProblemType[]> = {
    easy:    ['arithmetic', 'arithmetic', 'sequence', 'missing_digit', 'pattern', 'logic'],
    medium:  ['arithmetic', 'sequence', 'missing_digit', 'modular', 'digit_sum', 'equation', 'pattern', 'logic', 'prime'],
    hard:    ['sequence', 'modular', 'digit_sum', 'prime', 'factor', 'equation', 'pattern', 'logic'],
    genius:  ['sequence', 'modular', 'prime', 'factor', 'equation', 'pattern', 'logic', 'digit_sum'],
  };
  const pool = typePool[difficulty];
  const type = pool[randInt(0, pool.length - 1)];
  return GENERATORS[type](difficulty);
}

/** 按类型和难度生成 */
export function generateByType(type: ProblemType, difficulty: Difficulty): MathProblem {
  return GENERATORS[type](difficulty);
}

/** 分值权重 */
export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  genius: 100,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '入门',
  medium: '进阶',
  hard: '困难',
  genius: '天才',
};
