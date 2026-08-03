// Random helpers
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randVar(): string {
  return randChoice(['a', 'b', 'x', 'y']);
}

export function randVarPair(): [string, string] {
  const vars = ['a', 'b', 'x', 'y'];
  const v1 = randChoice(vars);
  let v2 = randChoice(vars.filter(v => v !== v1));
  return [v1, v2];
}

export function randBase(): number {
  return randInt(2, 7);
}

export function randPosExp(): number {
  return randInt(1, 6);
}

export function randNegExp(): number {
  return randInt(-6, -1);
}

export function randExp(): number {
  return randChoice([randPosExp(), randNegExp()]);
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function simplifyFrac(n: number, d: number): [number, number] {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d);
  return [n / g, d / g];
}

// Fraction type for exponents
export interface Frac {
  n: number; // numerator
  d: number; // denominator (always positive after simplification)
}

export function frac(n: number, d: number = 1): Frac {
  const [sn, sd] = simplifyFrac(n, d);
  return { n: sn, d: sd };
}

export function fracAdd(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function fracSub(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function fracMul(a: Frac, b: Frac): Frac {
  return frac(a.n * b.n, a.d * b.d);
}

export function fracEq(a: Frac, b: Frac): boolean {
  return a.n === b.n && a.d === b.d;
}

export function fracIsZero(f: Frac): boolean {
  return f.n === 0;
}

export function fracIsInt(f: Frac): boolean {
  return f.d === 1;
}

export function fracToNum(f: Frac): number {
  return f.n / f.d;
}

export function fracToLatex(f: Frac, color?: string): string {
  const wrap = (s: string) => color ? `\\textcolor{${color}}{${s}}` : s;
  if (f.d === 1) return wrap(`${f.n}`);
  if (f.n < 0) return wrap(`-\\frac{${Math.abs(f.n)}}{${f.d}}`);
  return wrap(`\\frac{${f.n}}{${f.d}}`);
}

export function fracToStr(f: Frac): string {
  if (f.d === 1) return `${f.n}`;
  return `${f.n}/${f.d}`;
}

// Power evaluation
export function safePow(base: number, exp: Frac): number | null {
  if (fracIsZero(exp)) return 1;
  if (fracIsInt(exp)) {
    const e = exp.n;
    if (e < 0) {
      const v = Math.pow(base, -e);
      if (v > 10000 || !Number.isFinite(v)) return null;
      return 1 / v;
    }
    const v = Math.pow(base, e);
    if (v > 10000 || !Number.isFinite(v)) return null;
    return v;
  }
  // fractional
  const root = Math.round(Math.pow(base, 1 / exp.d));
  if (Math.pow(root, exp.d) !== base) return null;
  const raised = Math.pow(root, Math.abs(exp.n));
  if (raised > 10000) return null;
  if (exp.n < 0) return 1 / raised;
  return raised;
}

// Format a number result nicely
export function numToLatex(n: number): string {
  if (Number.isInteger(n)) return `${n}`;
  // Check if it's a simple fraction
  for (let d = 1; d <= 1000; d++) {
    const num = n * d;
    if (Math.abs(num - Math.round(num)) < 1e-9) {
      const [sn, sd] = simplifyFrac(Math.round(num), d);
      if (sd === 1) return `${sn}`;
      if (sn < 0) return `-\\frac{${Math.abs(sn)}}{${sd}}`;
      return `\\frac{${sn}}{${sd}}`;
    }
  }
  return n.toFixed(4);
}

// KaTeX rendering helper - renders to HTML string
export function renderKatex(latex: string, displayMode: boolean = false): string {
  try {
    return (window as any).katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
    });
  } catch {
    return latex;
  }
}

// Build exponent LaTeX: base^{exp}
export function powLatex(base: string, exp: Frac, baseColor?: string, expColor?: string): string {
  const b = baseColor ? `\\textcolor{${baseColor}}{${base}}` : base;
  if (fracEq(exp, frac(1))) return b;
  if (fracEq(exp, frac(0))) return `${b}^{${expColor ? `\\textcolor{${expColor}}{0}` : '0'}}`;
  const eLatex = fracToLatex(exp, expColor);
  return `${b}^{${eLatex}}`;
}

// Perfect powers for fraction exponents
export const PERFECT_SQUARES = [4, 9, 16, 25, 36, 49];
export const PERFECT_CUBES = [8, 27, 64, 125];
export const PERFECT_4TH = [16, 81, 256, 625];

export function pickPerfectPower(root: number): number {
  if (root === 2) return randChoice(PERFECT_SQUARES);
  if (root === 3) return randChoice(PERFECT_CUBES);
  if (root === 4) return randChoice(PERFECT_4TH.filter(n => n <= 625));
  return randChoice([4, 8, 9, 16, 25, 27]);
}

export function nthRoot(n: number, k: number): number | null {
  if (n < 0 && k % 2 === 0) return null;
  const sign = n < 0 ? -1 : 1;
  const r = Math.round(Math.pow(Math.abs(n), 1 / k));
  if (Math.pow(r, k) === Math.abs(n)) return sign * r;
  return null;
}

// Math color palette
export const COLORS = {
  green: '#2E7D32',
  red: '#C62828',
  blue: '#1565C0',
  orange: '#E65100',
  purple: '#6A1B9A',
  yellow: '#F9A825',
  pink: '#AD1457',
  teal: '#00838F',
};

export const COLOR_NAMES = Object.keys(COLORS) as (keyof typeof COLORS)[];

export function getColor(index: number): string {
  return COLORS[COLOR_NAMES[index % COLOR_NAMES.length]];
}

export function colorWrap(latex: string, color: string): string {
  return `\\textcolor{${color}}{${latex}}`;
}

export function boldWrap(latex: string): string {
  return `\\mathbf{${latex}}`;
}
