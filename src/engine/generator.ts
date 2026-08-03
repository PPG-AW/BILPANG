import { Question, CommandType, SolutionStep } from './types';
import {
  randInt, randChoice, randVar, randVarPair, randBase,
  frac, Frac, fracAdd, fracSub, fracMul, fracToLatex, fracToStr,
  fracIsZero, fracEq, safePow, numToLatex, renderKatex,
  COLORS, getColor, colorWrap, boldWrap, PERFECT_SQUARES, PERFECT_CUBES,
  simplifyFrac,
} from '../utils/helpers';

// Decide command type randomly, but force 'simplify' if question has variables
function pickCommand(hasVar: boolean): CommandType {
  if (hasVar) return 'simplify';
  return randChoice(['simplify', 'compute'] as CommandType[]);
}

// ====== KATEX HELPERS ======
function k(latex: string): string {
  return renderKatex(latex, false);
}
function kd(latex: string): string {
  return renderKatex(latex, true);
}

const C = {
  green: COLORS.green,
  red: COLORS.red,
  blue: COLORS.blue,
  orange: COLORS.orange,
  purple: COLORS.purple,
  yellow: COLORS.yellow,
  pink: COLORS.pink,
  teal: COLORS.teal,
};

// ====== SOLUTION BUILDER ======
function step(title: string, content: string, math?: string): SolutionStep {
  return { title, content: content, math };
}

// ========================================
// TOPIC 1: Perkalian Bilangan Berpangkat
// ========================================
function genTopic1(subId: string): Question {
  switch (subId) {
    case '1a': return gen1a();
    case '1b': return gen1b();
    case '1c': return gen1c();
    case '1d': return gen1d();
    case '1e': return gen1e();
    case '1f': return gen1f();
    case '1g': return gen1g();
    case '1h': return gen1h();
    case '1i': return gen1i();
    case '1j': return gen1j();
    case '1k': return gen1k();
    case '1l': return gen1l();
    case '1m': return gen1m();
    default: return gen1a();
  }
}

// Helper: format base^exp without color, hiding exponent if 1
function formatPowLatexSimple(base: string, exp: Frac): string {
  if (fracEq(exp, frac(1))) return base;
  if (fracEq(exp, frac(0))) return '1';
  return `${base}^{${fracToLatex(exp)}}`;
}

function buildMultSolution(
  bases: string[], exps: Frac[], isVar: boolean,
  cmd: CommandType, _questionLatex?: string
): { steps: SolutionStep[], ansLatex: string, ansMQ: string, ansText: string } {
  const steps: SolutionStep[] = [];
  // Group by base
  const groups: Map<string, { exps: Frac[], colors: string[] }> = new Map();
  const baseColors: Map<string, string> = new Map();
  let ci = 0;
  for (let i = 0; i < bases.length; i++) {
    if (!baseColors.has(bases[i])) {
      baseColors.set(bases[i], getColor(ci++));
    }
  }
  
  const expColors: string[] = [];
  let eci = 0;
  const expColorList = [C.red, C.blue, C.purple, C.pink, C.yellow, C.teal, C.orange, C.green];
  for (let i = 0; i < exps.length; i++) {
    expColors.push(expColorList[eci % expColorList.length]);
    eci++;
  }

  // Step 1: Identify
  let identContent = '';
  if (baseColors.size === 1) {
    const [b] = [...baseColors.keys()];
    const bc = baseColors.get(b)!;
    identContent = `Kedua suku memiliki basis yang sama yaitu ${k(colorWrap(b, bc))}`;
  } else {
    identContent = `Terdapat ${baseColors.size} basis berbeda:<br/>`;
    for (const [b, bc] of baseColors) {
      identContent += `• Basis ${k(colorWrap(b, bc))}<br/>`;
    }
  }
  steps.push(step('Langkah 1: Identifikasi basis', identContent));

  // Step 2: Apply multiplication rule
  for (const [b] of baseColors) {
    if (!groups.has(b)) groups.set(b, { exps: [], colors: [] });
  }
  for (let i = 0; i < bases.length; i++) {
    groups.get(bases[i])!.exps.push(exps[i]);
    groups.get(bases[i])!.colors.push(expColors[i]);
  }

  let resultParts: { base: string, exp: Frac }[] = [];
  let stepNum = 2;
  
  for (const [b, g] of groups) {
    const bc = baseColors.get(b)!;
    if (g.exps.length === 1) {
      resultParts.push({ base: b, exp: g.exps[0] });
      continue;
    }
    const sumExp = g.exps.reduce((a, e) => fracAdd(a, e), frac(0));
    const expStr = g.exps.map((e, i) => `${colorWrap(fracToLatex(e), g.colors[i])}`).join(' + ');
    const lhs = g.exps.map((e, i) => `${colorWrap(b, bc)}^{${colorWrap(fracToLatex(e), g.colors[i])}}`).join(' \\times ');
    const rhs = `${colorWrap(b, bc)}^{${expStr}} = ${colorWrap(b, bc)}^{${boldWrap(fracToLatex(sumExp))}}`;

    steps.push(step(
      `Langkah ${stepNum}: Gunakan sifat perkalian pangkat untuk basis ${k(colorWrap(b, bc))}`,
      `Karena basisnya sama yaitu ${k(colorWrap(b, bc))}, maka pangkatnya dijumlahkan:`,
      kd(`${lhs} = ${rhs}`)
    ));
    stepNum++;
    resultParts.push({ base: b, exp: sumExp });
  }

  // Build final answer
  let ansLatex: string;
  let ansMQ: string;
  let ansText: string;
  
  if (cmd === 'compute' && !isVar) {
    // Compute numeric value
    let finalVal = 1;
    let computable = true;
    for (const p of resultParts) {
      const v = safePow(parseInt(p.base), p.exp);
      if (v === null) { computable = false; break; }
      finalVal *= v;
    }
    if (computable && Math.abs(finalVal) <= 10000) {
      const computeStr = resultParts.map(p => {
        const base = parseInt(p.base);
        const val = safePow(base, p.exp)!;
        const baseLatex = fracEq(p.exp, frac(1)) ? p.base : `${p.base}^{${fracToLatex(p.exp)}}`;
        return `${baseLatex} = ${boldWrap(numToLatex(val))}`;
      }).join(', \\quad ');
      
      steps.push(step(
        `Langkah ${stepNum}: Hitung nilainya`,
        ``,
        kd(computeStr + (resultParts.length > 1 ? ` \\quad \\Rightarrow \\quad ${boldWrap(numToLatex(finalVal))}` : ''))
      ));
      ansLatex = numToLatex(finalVal);
      ansMQ = `${finalVal}`;
      ansText = `${finalVal}`;
    } else {
      ansLatex = resultParts.map(p => formatPowLatexSimple(p.base, p.exp)).filter(s => s !== '1').join(' \\times ') || '1';
      ansMQ = ansLatex;
      ansText = ansLatex;
    }
  } else {
    ansLatex = resultParts.map(p => formatPowLatexSimple(p.base, p.exp)).filter(s => s !== '1' || resultParts.length === 1).join(' \\times ');
    if (!ansLatex || ansLatex === '') ansLatex = '1';
    ansMQ = ansLatex;
    ansText = ansLatex;
  }

  return { steps, ansLatex, ansMQ, ansText };
}

function gen1a(): Question {
  const b = randBase();
  const e1 = randInt(1, 5), e2 = randInt(1, 5);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\times ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`], [frac(e1), frac(e2)], false, cmd, qLatex
  );
  return {
    subtypeId: '1a', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^${e1} × ${b}^${e2}`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1b(): Question {
  const b = randBase();
  const e1 = randInt(1, 5), e2 = randInt(-5, -1);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\times ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`], [frac(e1), frac(e2)], false, cmd, qLatex
  );
  return {
    subtypeId: '1b', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^${e1} × ${b}^(${e2})`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1c(): Question {
  const b = randBase();
  const e1 = randInt(1, 5);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\times ${b}^{0}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`], [frac(e1), frac(0)], false, cmd, qLatex
  );
  return {
    subtypeId: '1c', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^${e1} × ${b}^0`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1d(): Question {
  const b = randChoice([4, 9, 16, 25]); // perfect squares for nice fractions
  const [n1, d1] = [randInt(1, 3), 2];
  const [n2, d2] = [randInt(1, 3), 2];
  const cmd = pickCommand(false);
  const qLatex = `${b}^{\\frac{${n1}}{${d1}}} \\times ${b}^{\\frac{${n2}}{${d2}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`], [frac(n1, d1), frac(n2, d2)], false, cmd, qLatex
  );
  return {
    subtypeId: '1d', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^(${n1}/${d1}) × ${b}^(${n2}/${d2})`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1e(): Question {
  const v = randVar();
  const e1 = randInt(2, 6), e2 = randInt(2, 6);
  const cmd: CommandType = 'simplify';
  const qLatex = `${v}^{${e1}} \\times ${v}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [v, v], [frac(e1), frac(e2)], true, cmd, qLatex
  );
  return {
    subtypeId: '1e', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${v}^${e1} × ${v}^${e2}`,
    answerText: ansText, hasVariable: true,
  };
}

function gen1f(): Question {
  const v = randVar();
  const e1 = randInt(2, 6), e2 = randInt(-5, -1);
  const cmd: CommandType = 'simplify';
  const qLatex = `${v}^{${e1}} \\times ${v}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [v, v], [frac(e1), frac(e2)], true, cmd, qLatex
  );
  return {
    subtypeId: '1f', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${v}^${e1} × ${v}^(${e2})`,
    answerText: ansText, hasVariable: true,
  };
}

function gen1g(): Question {
  const v = randVar();
  const [n1, d1] = [1, 2];
  const [n2, d2] = [randInt(1, 5), 2];
  const cmd: CommandType = 'simplify';
  const qLatex = `${v}^{\\frac{${n1}}{${d1}}} \\times ${v}^{\\frac{${n2}}{${d2}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [v, v], [frac(n1, d1), frac(n2, d2)], true, cmd, qLatex
  );
  return {
    subtypeId: '1g', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${v}^(${n1}/${d1}) × ${v}^(${n2}/${d2})`,
    answerText: ansText, hasVariable: true,
  };
}

function gen1h(): Question {
  const [v1, v2] = randVarPair();
  const e1 = randInt(2, 5), e2 = randInt(1, 4), e3 = randInt(1, 5), e4 = randInt(1, 3);
  const cmd: CommandType = 'simplify';
  const qLatex = `${v1}^{${e1}} \\times ${v2}^{${e2}} \\times ${v1}^{${e3}} \\times ${v2}^{${e4}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [v1, v2, v1, v2], [frac(e1), frac(e2), frac(e3), frac(e4)], true, cmd, qLatex
  );
  return {
    subtypeId: '1h', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${v1}^${e1} × ${v2}^${e2} × ${v1}^${e3} × ${v2}^${e4}`,
    answerText: ansText, hasVariable: true,
  };
}

function gen1i(): Question {
  const b = randBase();
  const v = randVar();
  const e1 = randInt(1, 4), e2 = randInt(1, 4), e3 = randInt(1, 3), e4 = randInt(1, 4);
  const cmd: CommandType = 'simplify';
  const qLatex = `${b}^{${e1}} \\times ${v}^{${e2}} \\times ${b}^{${e3}} \\times ${v}^{${e4}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, v, `${b}`, v], [frac(e1), frac(e2), frac(e3), frac(e4)], true, cmd, qLatex
  );
  return {
    subtypeId: '1i', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^${e1} × ${v}^${e2} × ${b}^${e3} × ${v}^${e4}`,
    answerText: ansText, hasVariable: true,
  };
}

function gen1j(): Question {
  const b = randBase();
  const e1 = randInt(1, 3), e2 = randInt(1, 3), e3 = randInt(1, 4), e4 = randInt(-3, -1);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\times ${b}^{${e2}} \\times ${b}^{${e3}} \\times ${b}^{${e4}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`, `${b}`, `${b}`], [frac(e1), frac(e2), frac(e3), frac(e4)], false, cmd, qLatex
  );
  return {
    subtypeId: '1j', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^${e1} × ${b}^${e2} × ${b}^${e3} × ${b}^(${e4})`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1k(): Question {
  const b = randBase();
  const e1 = randInt(-5, -1), e2 = randInt(-5, -1);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\times ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`], [frac(e1), frac(e2)], false, cmd, qLatex
  );
  return {
    subtypeId: '1k', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^(${e1}) × ${b}^(${e2})`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1l(): Question {
  const b = randChoice([4, 8, 9, 16, 27]);
  const d = randChoice([2, 3]);
  const n1 = randInt(1, d - 1 > 0 ? d - 1 : 1), n2 = d - n1 > 0 ? d - n1 : randInt(1, d);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{\\frac{${n1}}{${d}}} \\times ${b}^{\\frac{${n2}}{${d}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [`${b}`, `${b}`], [frac(n1, d), frac(n2, d)], false, cmd, qLatex
  );
  return {
    subtypeId: '1l', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${b}^(${n1}/${d}) × ${b}^(${n2}/${d})`,
    answerText: ansText, hasVariable: false,
  };
}

function gen1m(): Question {
  const [v1, v2] = randVarPair();
  const d1 = 2, d2 = 3;
  const n1 = 1, n2 = 1, n3 = randInt(1, 3), n4 = randInt(1, 2);
  const cmd: CommandType = 'simplify';
  const qLatex = `${v1}^{\\frac{${n1}}{${d1}}} \\times ${v2}^{\\frac{${n2}}{${d2}}} \\times ${v1}^{\\frac{${n3}}{${d1}}} \\times ${v2}^{\\frac{${n4}}{${d2}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(
    [v1, v2, v1, v2], [frac(n1, d1), frac(n2, d2), frac(n3, d1), frac(n4, d2)], true, cmd, qLatex
  );
  return {
    subtypeId: '1m', topicId: 1, commandType: cmd,
    questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ,
    solutionSteps: steps, questionText: `${v1}^(${n1}/${d1}) × ${v2}^(${n2}/${d2}) × ${v1}^(${n3}/${d1}) × ${v2}^(${n4}/${d2})`,
    answerText: ansText, hasVariable: true,
  };
}

// ========================================
// TOPIC 2: Pembagian Bilangan Berpangkat
// ========================================
function genTopic2(subId: string): Question {
  switch (subId) {
    case '2a': return gen2a(); case '2b': return gen2b(); case '2c': return gen2c();
    case '2d': return gen2d(); case '2e': return gen2e(); case '2f': return gen2f();
    case '2g': return gen2g(); case '2h': return gen2h(); case '2i': return gen2i();
    case '2j': return gen2j(); case '2k': return gen2k();
    default: return gen2a();
  }
}

function buildDivSolution(
  numBases: string[], numExps: Frac[],
  denBases: string[], denExps: Frac[],
  _isVar: boolean, _cmd: CommandType
): { steps: SolutionStep[], ansLatex: string, ansMQ: string, ansText: string } {
  const steps: SolutionStep[] = [];
  
  // Collect all bases
  const allBases = new Set([...numBases, ...denBases]);
  const baseColors: Map<string, string> = new Map();
  let ci = 0;
  for (const b of allBases) {
    baseColors.set(b, getColor(ci++));
  }

  // Assign colors to each exponent for tracking
  const expColors: string[] = [];
  const expColorList = [C.red, C.blue, C.purple, C.pink, C.yellow, C.teal, C.orange];
  for (let i = 0; i < numExps.length + denExps.length; i++) {
    expColors.push(expColorList[i % expColorList.length]);
  }

  // Step 1: Identify all terms with their colors
  let identContent = `Terdapat ${allBases.size} basis berbeda. Perhatikan warna berikut:<br/>`;
  for (const b of allBases) {
    identContent += `• Semua basis ${k(colorWrap(`\\mathbf{${b}}`, baseColors.get(b)!))}<br/>`;
  }
  identContent += `<br/>Pangkat di pembilang:<br/>`;
  for (let i = 0; i < numBases.length; i++) {
    const bc = baseColors.get(numBases[i])!;
    identContent += `• ${k(colorWrap(numBases[i], bc))} berpangkat ${k(colorWrap(fracToLatex(numExps[i]), expColors[i]))}<br/>`;
  }
  identContent += `<br/>Pangkat di penyebut:<br/>`;
  for (let i = 0; i < denBases.length; i++) {
    const bc = baseColors.get(denBases[i])!;
    identContent += `• ${k(colorWrap(denBases[i], bc))} berpangkat ${k(colorWrap(fracToLatex(denExps[i]), expColors[numExps.length + i]))}<br/>`;
  }
  steps.push(step('Langkah 1: Identifikasi semua suku dan pangkatnya', identContent));

  // Step 2: Group and simplify numerator if multiple same bases
  let stepNum = 2;
  const numGroups: Map<string, { exps: Frac[], colors: string[], sum: Frac }> = new Map();
  for (let i = 0; i < numBases.length; i++) {
    const b = numBases[i];
    if (!numGroups.has(b)) {
      numGroups.set(b, { exps: [], colors: [], sum: frac(0) });
    }
    const g = numGroups.get(b)!;
    g.exps.push(numExps[i]);
    g.colors.push(expColors[i]);
    g.sum = fracAdd(g.sum, numExps[i]);
  }

  // Check if numerator needs grouping
  let numNeedsGrouping = false;
  for (const [, g] of numGroups) {
    if (g.exps.length > 1) numNeedsGrouping = true;
  }

  if (numNeedsGrouping) {
    let groupContent = 'Kelompokkan basis yang sama di pembilang:<br/>';
    for (const [b, g] of numGroups) {
      const bc = baseColors.get(b)!;
      if (g.exps.length > 1) {
        const terms = g.exps.map((e, i) => `${colorWrap(b, bc)}^{${colorWrap(fracToLatex(e), g.colors[i])}}`).join(' \\times ');
        const expSum = g.exps.map((e, i) => colorWrap(fracToLatex(e), g.colors[i])).join(' + ');
        groupContent += `• Basis ${k(colorWrap(b, bc))}: ${k(terms)} = ${k(`${colorWrap(b, bc)}^{${expSum}}`)} = ${k(`${colorWrap(b, bc)}^{${boldWrap(fracToLatex(g.sum))}}`)} (pangkat dijumlahkan)<br/>`;
      } else {
        groupContent += `• Basis ${k(colorWrap(b, bc))}: ${k(`${colorWrap(b, bc)}^{${fracToLatex(g.sum)}}`)} (tetap)<br/>`;
      }
    }
    steps.push(step(`Langkah ${stepNum}: Sederhanakan pembilang`, groupContent));
    stepNum++;
  }

  // Step 3: Group and simplify denominator if multiple same bases
  const denGroups: Map<string, { exps: Frac[], colors: string[], sum: Frac }> = new Map();
  for (let i = 0; i < denBases.length; i++) {
    const b = denBases[i];
    if (!denGroups.has(b)) {
      denGroups.set(b, { exps: [], colors: [], sum: frac(0) });
    }
    const g = denGroups.get(b)!;
    g.exps.push(denExps[i]);
    g.colors.push(expColors[numExps.length + i]);
    g.sum = fracAdd(g.sum, denExps[i]);
  }

  let denNeedsGrouping = false;
  for (const [, g] of denGroups) {
    if (g.exps.length > 1) denNeedsGrouping = true;
  }

  if (denNeedsGrouping) {
    let groupContent = 'Kelompokkan basis yang sama di penyebut:<br/>';
    for (const [b, g] of denGroups) {
      const bc = baseColors.get(b)!;
      if (g.exps.length > 1) {
        const terms = g.exps.map((e, i) => `${colorWrap(b, bc)}^{${colorWrap(fracToLatex(e), g.colors[i])}}`).join(' \\times ');
        const expSum = g.exps.map((e, i) => colorWrap(fracToLatex(e), g.colors[i])).join(' + ');
        groupContent += `• Basis ${k(colorWrap(b, bc))}: ${k(terms)} = ${k(`${colorWrap(b, bc)}^{${expSum}}`)} = ${k(`${colorWrap(b, bc)}^{${boldWrap(fracToLatex(g.sum))}}`)} (pangkat dijumlahkan)<br/>`;
      } else {
        groupContent += `• Basis ${k(colorWrap(b, bc))}: ${k(`${colorWrap(b, bc)}^{${fracToLatex(g.sum)}}`)} (tetap)<br/>`;
      }
    }
    steps.push(step(`Langkah ${stepNum}: Sederhanakan penyebut`, groupContent));
    stepNum++;
  }

  // Step 4: Division - subtract exponents for each base
  const resultParts: { base: string, exp: Frac }[] = [];
  let divContent = 'Gunakan sifat pembagian pangkat (pangkat pembilang dikurangi pangkat penyebut):<br/>';
  
  for (const b of allBases) {
    const bc = baseColors.get(b)!;
    const nExp = numGroups.get(b)?.sum || frac(0);
    const dExp = denGroups.get(b)?.sum || frac(0);
    const resExp = fracSub(nExp, dExp);

    if (!fracIsZero(nExp) || !fracIsZero(dExp)) {
      if (fracIsZero(nExp)) {
        divContent += `• Basis ${k(colorWrap(b, bc))}: hanya ada di penyebut dengan pangkat ${k(fracToLatex(dExp))}, maka hasilnya ${k(`${colorWrap(b, bc)}^{${boldWrap(fracToLatex(resExp))}}`)} (dipindah ke pembilang dengan tanda negatif)<br/>`;
      } else if (fracIsZero(dExp)) {
        divContent += `• Basis ${k(colorWrap(b, bc))}: hanya ada di pembilang dengan pangkat ${k(fracToLatex(nExp))}, tetap ${k(formatPowLatex(b, nExp, bc))}<br/>`;
      } else {
        divContent += `• Basis ${k(colorWrap(b, bc))}: ${k(`${fracToLatex(nExp)} - (${fracToLatex(dExp)}) = ${boldWrap(fracToLatex(resExp))}`)} → ${k(formatPowLatex(b, resExp, bc))}<br/>`;
      }
    }
    resultParts.push({ base: b, exp: resExp });
  }
  steps.push(step(`Langkah ${stepNum}: Bagi pembilang dengan penyebut`, divContent));
  stepNum++;

  // Step 5: Handle negative exponents
  const negatives = resultParts.filter(p => p.exp.n < 0);
  if (negatives.length > 0) {
    let negContent = 'Pangkat negatif artinya dipindahkan ke penyebut dan pangkatnya menjadi positif:<br/>';
    for (const p of negatives) {
      const bc = baseColors.get(p.base)!;
      const posExp = frac(-p.exp.n, p.exp.d);
      negContent += `• ${k(`${colorWrap(p.base, bc)}^{${fracToLatex(p.exp)}}`)} = ${k(`\\frac{1}{${formatPowLatex(p.base, posExp, bc)}}`)} <br/>`;
    }
    steps.push(step(`Langkah ${stepNum}: Sederhanakan pangkat negatif`, negContent));
    stepNum++;
  }

  // Step 6: Final result
  const ansLatex = buildResultLatex(resultParts);
  steps.push(step(`Langkah ${stepNum}: Gabungkan hasil akhir`, `Jawaban dalam bentuk paling sederhana:`, kd(ansLatex)));

  return { steps, ansLatex, ansMQ: ansLatex, ansText: ansLatex };
}

// Helper: format base^exp, hiding exponent if 1
function formatPowLatex(base: string, exp: Frac, baseColor?: string): string {
  const b = baseColor ? colorWrap(base, baseColor) : base;
  if (fracEq(exp, frac(1))) return b;
  if (fracEq(exp, frac(0))) return '1';
  return `${b}^{${fracToLatex(exp)}}`;
}

function buildResultLatex(parts: { base: string, exp: Frac }[]): string {
  const nonZero = parts.filter(p => !fracEq(p.exp, frac(0)));
  if (nonZero.length === 0) return '1';
  
  const positive = nonZero.filter(p => p.exp.n > 0);
  const negative = nonZero.filter(p => p.exp.n < 0);
  
  const buildPart = (ps: { base: string, exp: Frac }[], flipSign: boolean) => {
    return ps.map(p => {
      const e = flipSign ? frac(-p.exp.n, p.exp.d) : p.exp;
      if (fracEq(e, frac(1))) return p.base;
      return `${p.base}^{${fracToLatex(e)}}`;
    }).join(' \\times ');
  };
  
  if (negative.length === 0) {
    return buildPart(positive, false);
  }
  if (positive.length === 0) {
    return `\\frac{1}{${buildPart(negative, true)}}`;
  }
  return `\\frac{${buildPart(positive, false)}}{${buildPart(negative, true)}}`;
}

function gen2a(): Question {
  const b = randBase();
  const e1 = randInt(3, 7), e2 = randInt(1, e1 - 1);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\div ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([`${b}`], [frac(e1)], [`${b}`], [frac(e2)], false, cmd);
  return { subtypeId: '2a', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${b}^${e1} ÷ ${b}^${e2}`, answerText: ansText, hasVariable: false };
}

function gen2b(): Question {
  const b = randBase();
  const e1 = randInt(2, 5), e2 = randInt(-4, -1);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\div ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([`${b}`], [frac(e1)], [`${b}`], [frac(e2)], false, cmd);
  return { subtypeId: '2b', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${b}^${e1} ÷ ${b}^(${e2})`, answerText: ansText, hasVariable: false };
}

function gen2c(): Question {
  const b = randChoice([4, 9, 16, 25]);
  const n1 = randInt(3, 5), n2 = randInt(1, 2);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{\\frac{${n1}}{2}} \\div ${b}^{\\frac{${n2}}{2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([`${b}`], [frac(n1, 2)], [`${b}`], [frac(n2, 2)], false, cmd);
  return { subtypeId: '2c', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${b}^(${n1}/2) ÷ ${b}^(${n2}/2)`, answerText: ansText, hasVariable: false };
}

function gen2d(): Question {
  const v = randVar();
  const e1 = randInt(3, 7), e2 = randInt(1, e1 - 1);
  const cmd: CommandType = 'simplify';
  const qLatex = `${v}^{${e1}} \\div ${v}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([v], [frac(e1)], [v], [frac(e2)], true, cmd);
  return { subtypeId: '2d', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${v}^${e1} ÷ ${v}^${e2}`, answerText: ansText, hasVariable: true };
}

function gen2e(): Question {
  const v = randVar();
  const e1 = randInt(2, 5), e2 = randInt(-4, -1);
  const cmd: CommandType = 'simplify';
  const qLatex = `${v}^{${e1}} \\div ${v}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([v], [frac(e1)], [v], [frac(e2)], true, cmd);
  return { subtypeId: '2e', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${v}^${e1} ÷ ${v}^(${e2})`, answerText: ansText, hasVariable: true };
}

function gen2f(): Question {
  const v = randVar();
  const n1 = randInt(3, 7), n2 = randInt(1, 2);
  const d = 3;
  const cmd: CommandType = 'simplify';
  const qLatex = `${v}^{\\frac{${n1}}{${d}}} \\div ${v}^{\\frac{${n2}}{${d}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([v], [frac(n1, d)], [v], [frac(n2, d)], true, cmd);
  return { subtypeId: '2f', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${v}^(${n1}/${d}) ÷ ${v}^(${n2}/${d})`, answerText: ansText, hasVariable: true };
}

function gen2g(): Question {
  const [v1, v2] = randVarPair();
  const e1 = randInt(3, 6), e2 = randInt(3, 5), e3 = randInt(1, e1 - 1), e4 = randInt(1, e2 - 1);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\frac{${v1}^{${e1}} \\times ${v2}^{${e2}}}{${v1}^{${e3}} \\times ${v2}^{${e4}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([v1, v2], [frac(e1), frac(e2)], [v1, v2], [frac(e3), frac(e4)], true, cmd);
  return { subtypeId: '2g', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v1}^${e1} × ${v2}^${e2}) ÷ (${v1}^${e3} × ${v2}^${e4})`, answerText: ansText, hasVariable: true };
}

function gen2h(): Question {
  const b = randBase();
  const v = randVar();
  const e1 = randInt(3, 5), e2 = randInt(3, 5), e3 = randInt(1, e1 - 1), e4 = randInt(1, e2 - 1);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\frac{${b}^{${e1}} \\times ${v}^{${e2}}}{${b}^{${e3}} \\times ${v}^{${e4}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([`${b}`, v], [frac(e1), frac(e2)], [`${b}`, v], [frac(e3), frac(e4)], true, cmd);
  return { subtypeId: '2h', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^${e1} × ${v}^${e2}) ÷ (${b}^${e3} × ${v}^${e4})`, answerText: ansText, hasVariable: true };
}

function gen2i(): Question {
  const b = randBase();
  const e1 = randInt(1, 3), e2 = randInt(e1 + 2, 7);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\div ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([`${b}`], [frac(e1)], [`${b}`], [frac(e2)], false, cmd);
  return { subtypeId: '2i', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${b}^${e1} ÷ ${b}^${e2}`, answerText: ansText, hasVariable: false };
}

function gen2j(): Question {
  const b = randBase();
  const e1 = randInt(-2, -1), e2 = randInt(-5, -3);
  const cmd = pickCommand(false);
  const qLatex = `${b}^{${e1}} \\div ${b}^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([`${b}`], [frac(e1)], [`${b}`], [frac(e2)], false, cmd);
  return { subtypeId: '2j', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `${b}^(${e1}) ÷ ${b}^(${e2})`, answerText: ansText, hasVariable: false };
}

function gen2k(): Question {
  const [v1, v2] = randVarPair();
  const n1 = randInt(2, 5), n2 = randInt(3, 5), n3 = randInt(1, n1 - 1 || 1), n4 = randInt(1, n2 - 1 || 1);
  const d = randChoice([2, 3]);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\frac{${v1}^{\\frac{${n1}}{${d}}} \\times ${v2}^{\\frac{${n2}}{${d}}}}{${v1}^{\\frac{${n3}}{${d}}} \\times ${v2}^{\\frac{${n4}}{${d}}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution([v1, v2], [frac(n1, d), frac(n2, d)], [v1, v2], [frac(n3, d), frac(n4, d)], true, cmd);
  return { subtypeId: '2k', topicId: 2, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v1}^(${n1}/${d}) × ${v2}^(${n2}/${d})) ÷ (${v1}^(${n3}/${d}) × ${v2}^(${n4}/${d}))`, answerText: ansText, hasVariable: true };
}

// ========================================
// TOPIC 3: Pangkat dari Pangkat
// ========================================
function genTopic3(subId: string): Question {
  switch (subId) {
    case '3a': return gen3a(); case '3b': return gen3b(); case '3c': return gen3c();
    case '3d': return gen3d(); case '3e': return gen3e(); case '3f': return gen3f();
    case '3g': return gen3g(); case '3h': return gen3h(); case '3i': return gen3i();
    case '3j': return gen3j(); case '3k': return gen3k(); case '3l': return gen3l();
    case '3m': return gen3m(); case '3n': return gen3n();
    default: return gen3a();
  }
}

function buildPowerOfPowerSolution(
  base: string, innerExp: Frac, outerExp: Frac,
  isVar: boolean, cmd: CommandType,
  extraMult?: { base: string, exp: Frac },
  extraDiv?: { base: string, exp: Frac }
): { steps: SolutionStep[], ansLatex: string, ansMQ: string, ansText: string } {
  const steps: SolutionStep[] = [];
  const bc = C.green;
  const resultExp = fracMul(innerExp, outerExp);
  
  steps.push(step(
    'Langkah 1: Gunakan sifat pangkat dari pangkat',
    `Pangkat dikalikan pangkat: pangkat dalam ${k(colorWrap(fracToLatex(innerExp), C.red))} dikali pangkat luar ${k(colorWrap(fracToLatex(outerExp), C.blue))}`,
    kd(`\\left(${colorWrap(base, bc)}^{${colorWrap(fracToLatex(innerExp), C.red)}}\\right)^{${colorWrap(fracToLatex(outerExp), C.blue)}} = ${colorWrap(base, bc)}^{${colorWrap(fracToLatex(innerExp), C.red)} \\times ${colorWrap(fracToLatex(outerExp), C.blue)}} = ${colorWrap(base, bc)}^{${boldWrap(fracToLatex(resultExp))}}`)
  ));

  let finalExp = resultExp;
  let stepNum = 2;

  if (extraMult) {
    const addedExp = fracAdd(finalExp, extraMult.exp);
    steps.push(step(
      `Langkah ${stepNum}: Kalikan dengan ${k(`${extraMult.base}^{${fracToLatex(extraMult.exp)}}`)}`,
      `Karena basisnya sama, pangkat dijumlahkan:`,
      kd(`${colorWrap(base, bc)}^{${boldWrap(fracToLatex(finalExp))}} \\times ${colorWrap(base, bc)}^{${colorWrap(fracToLatex(extraMult.exp), C.purple)}} = ${colorWrap(base, bc)}^{${boldWrap(fracToLatex(addedExp))}}`)
    ));
    finalExp = addedExp;
    stepNum++;
  }

  if (extraDiv) {
    const subbedExp = fracSub(finalExp, extraDiv.exp);
    steps.push(step(
      `Langkah ${stepNum}: Bagi dengan ${k(`${extraDiv.base}^{${fracToLatex(extraDiv.exp)}}`)}`,
      `Karena basisnya sama, pangkat dikurangi:`,
      kd(`${colorWrap(base, bc)}^{${boldWrap(fracToLatex(finalExp))}} \\div ${colorWrap(base, bc)}^{${colorWrap(fracToLatex(extraDiv.exp), C.purple)}} = ${colorWrap(base, bc)}^{${boldWrap(fracToLatex(subbedExp))}}`)
    ));
    finalExp = subbedExp;
    stepNum++;
  }

  let ansLatex: string;
  let ansText: string;

  if (cmd === 'compute' && !isVar) {
    const baseNum = parseInt(base);
    const val = safePow(baseNum, finalExp);
    if (val !== null && Math.abs(val) <= 10000) {
      steps.push(step(
        `Langkah ${stepNum}: Hitung nilainya`,
        ``,
        kd(`${base}^{${fracToLatex(finalExp)}} = ${boldWrap(numToLatex(val))}`)
      ));
      ansLatex = numToLatex(val);
      ansText = `${val}`;
    } else {
      ansLatex = `${base}^{${fracToLatex(finalExp)}}`;
      ansText = ansLatex;
    }
  } else {
    if (fracEq(finalExp, frac(0))) { ansLatex = '1'; ansText = '1'; }
    else if (fracEq(finalExp, frac(1))) { ansLatex = base; ansText = base; }
    else { ansLatex = `${base}^{${fracToLatex(finalExp)}}`; ansText = ansLatex; }
  }

  return { steps, ansLatex, ansMQ: ansLatex, ansText };
}

function gen3a(): Question {
  const b = randBase();
  const e1 = randInt(2, 4), e2 = randInt(2, 3);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{${e1}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(e2), false, cmd);
  return { subtypeId: '3a', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^${e1})^${e2}`, answerText: ansText, hasVariable: false };
}

function gen3b(): Question {
  const b = randBase();
  const e1 = randInt(2, 3), e2 = randInt(-3, -1);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{${e1}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(e2), false, cmd);
  return { subtypeId: '3b', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^${e1})^(${e2})`, answerText: ansText, hasVariable: false };
}

function gen3c(): Question {
  const b = randBase();
  const e1 = randInt(-3, -1), e2 = randInt(2, 3);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{${e1}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(e2), false, cmd);
  return { subtypeId: '3c', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^(${e1}))^${e2}`, answerText: ansText, hasVariable: false };
}

function gen3d(): Question {
  const b = randChoice([4, 9, 16, 25]);
  const e1 = randInt(2, 4);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{${e1}}\\right)^{\\frac{1}{2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(1, 2), false, cmd);
  return { subtypeId: '3d', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^${e1})^(1/2)`, answerText: ansText, hasVariable: false };
}

function gen3e(): Question {
  const b = randChoice([8, 27, 64]);
  const e2 = randInt(2, 3);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{\\frac{1}{3}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(1, 3), frac(e2), false, cmd);
  return { subtypeId: '3e', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^(1/3))^${e2}`, answerText: ansText, hasVariable: false };
}

function gen3f(): Question {
  const v = randVar();
  const e1 = randInt(2, 5), e2 = randInt(2, 4);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\left(${v}^{${e1}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(v, frac(e1), frac(e2), true, cmd);
  return { subtypeId: '3f', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v}^${e1})^${e2}`, answerText: ansText, hasVariable: true };
}

function gen3g(): Question {
  const v = randVar();
  const e1 = randInt(-4, -1), e2 = randInt(2, 3);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\left(${v}^{${e1}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(v, frac(e1), frac(e2), true, cmd);
  return { subtypeId: '3g', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v}^(${e1}))^${e2}`, answerText: ansText, hasVariable: true };
}

function gen3h(): Question {
  const v = randVar();
  const e2 = randInt(2, 6);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\left(${v}^{\\frac{1}{2}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(v, frac(1, 2), frac(e2), true, cmd);
  return { subtypeId: '3h', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v}^(1/2))^${e2}`, answerText: ansText, hasVariable: true };
}

function gen3i(): Question {
  const b = randBase();
  const e1 = randInt(2, 3), e2 = randInt(2, 3), e3 = randInt(1, 3);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{${e1}}\\right)^{${e2}} \\times ${b}^{${e3}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(e2), false, cmd, { base: `${b}`, exp: frac(e3) });
  return { subtypeId: '3i', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^${e1})^${e2} × ${b}^${e3}`, answerText: ansText, hasVariable: false };
}

function gen3j(): Question {
  const v = randVar();
  const e1 = randInt(2, 4), e2 = randInt(2, 3), e3 = randInt(1, 4);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\frac{\\left(${v}^{${e1}}\\right)^{${e2}}}{${v}^{${e3}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(v, frac(e1), frac(e2), true, cmd, undefined, { base: v, exp: frac(e3) });
  return { subtypeId: '3j', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v}^${e1})^${e2} ÷ ${v}^${e3}`, answerText: ansText, hasVariable: true };
}

function gen3k(): Question {
  const b = randBase();
  const e1 = 2, e2 = 2, e3 = 2;
  const cmd = pickCommand(false);
  const totalExp = frac(e1 * e2 * e3);
  const qLatex = `\\left(\\left(${b}^{${e1}}\\right)^{${e2}}\\right)^{${e3}}`;
  
  const steps: SolutionStep[] = [];
  steps.push(step(
    'Langkah 1: Selesaikan pangkat dari pangkat dari dalam ke luar',
    `Pertama, selesaikan pangkat dalam: ${k(colorWrap(`${e1}`, C.red))} × ${k(colorWrap(`${e2}`, C.blue))} = ${k(boldWrap(`${e1*e2}`))}`,
    kd(`\\left(${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e1}`, C.red)}}\\right)^{${colorWrap(`${e2}`, C.blue)}} = ${colorWrap(`${b}`, C.green)}^{${boldWrap(`${e1*e2}`)}}`)
  ));
  steps.push(step(
    'Langkah 2: Lanjutkan dengan pangkat luar',
    `Pangkat ${k(boldWrap(`${e1*e2}`))} dikali ${k(colorWrap(`${e3}`, C.purple))}:`,
    kd(`\\left(${colorWrap(`${b}`, C.green)}^{${boldWrap(`${e1*e2}`)}}\\right)^{${colorWrap(`${e3}`, C.purple)}} = ${colorWrap(`${b}`, C.green)}^{${boldWrap(`${e1*e2}`)} \\times ${colorWrap(`${e3}`, C.purple)}} = ${colorWrap(`${b}`, C.green)}^{${boldWrap(`${totalExp.n}`)}}`)
  ));

  let ansLatex = `${b}^{${totalExp.n}}`;
  let ansText = ansLatex;
  if (cmd === 'compute') {
    const val = safePow(b, totalExp);
    if (val !== null && Math.abs(val) <= 10000) {
      steps.push(step('Langkah 3: Hitung nilainya', '', kd(`${b}^{${totalExp.n}} = ${boldWrap(numToLatex(val))}`)));
      ansLatex = numToLatex(val);
      ansText = `${val}`;
    }
  }
  
  return { subtypeId: '3k', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `((${b}^${e1})^${e2})^${e3}`, answerText: ansText, hasVariable: false };
}

function gen3l(): Question {
  const v = randVar();
  const e1 = randInt(-3, -1), e2 = randInt(-3, -1);
  const cmd: CommandType = 'simplify';
  const qLatex = `\\left(${v}^{${e1}}\\right)^{${e2}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(v, frac(e1), frac(e2), true, cmd);
  return { subtypeId: '3l', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v}^(${e1}))^(${e2})`, answerText: ansText, hasVariable: true };
}

function gen3m(): Question {
  const v = randVar();
  const n1 = 1, d1 = 2, n2 = randInt(1, 3), d2 = 3;
  const cmd: CommandType = 'simplify';
  const qLatex = `\\left(${v}^{\\frac{${n1}}{${d1}}}\\right)^{\\frac{${n2}}{${d2}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(v, frac(n1, d1), frac(n2, d2), true, cmd);
  return { subtypeId: '3m', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${v}^(${n1}/${d1}))^(${n2}/${d2})`, answerText: ansText, hasVariable: true };
}

function gen3n(): Question {
  const b = randChoice([4, 8, 9, 16, 25, 27]);
  const e1 = randInt(-3, -1);
  const d2 = randChoice([2, 3]);
  const cmd = pickCommand(false);
  const qLatex = `\\left(${b}^{${e1}}\\right)^{\\frac{1}{${d2}}}`;
  const { steps, ansLatex, ansMQ, ansText } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(1, d2), false, cmd);
  return { subtypeId: '3n', topicId: 3, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: `(${b}^(${e1}))^(1/${d2})`, answerText: ansText, hasVariable: false };
}

// ========================================
// TOPICS 4-9: Simpler generators
// ========================================

function genTopic4(subId: string): Question {
  const b1 = randInt(2, 5), b2 = randInt(2, 5);
  const v1 = randVar(), v2 = randChoice(['a','b','x','y'].filter(c => c !== v1));
  
  const genFracPow = (num: string, den: string, exp: Frac, isVar: boolean, cmd: CommandType): { steps: SolutionStep[], ansLatex: string, ansMQ: string, ansText: string } => {
    const steps: SolutionStep[] = [];
    
    if (fracIsZero(exp)) {
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Bilangan apapun berpangkat nol hasilnya 1`, kd(`\\left(\\frac{${num}}{${den}}\\right)^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`)));
      return { steps, ansLatex: '1', ansMQ: '1', ansText: '1' };
    }
    
    const isNeg = exp.n < 0;
    const absExp = frac(Math.abs(exp.n), exp.d);
    
    if (isNeg) {
      steps.push(step(
        'Langkah 1: Gunakan sifat pangkat negatif',
        `Pangkat negatif membalik pecahan dan pangkat menjadi positif:`,
        kd(`\\left(\\frac{${colorWrap(num, C.green)}}{${colorWrap(den, C.orange)}}\\right)^{${colorWrap(fracToLatex(exp), C.red)}} = \\left(\\frac{${colorWrap(den, C.orange)}}{${colorWrap(num, C.green)}}\\right)^{${colorWrap(fracToLatex(absExp), C.blue)}}`)
      ));
      // swap num and den
      const temp = num; num = den; den = temp;
    }
    
    const stepStart = isNeg ? 2 : 1;
    steps.push(step(
      `Langkah ${stepStart}: Gunakan sifat pecahan dipangkatkan`,
      `Pangkat diterapkan ke pembilang dan penyebut:`,
      kd(`\\left(\\frac{${colorWrap(num, C.green)}}{${colorWrap(den, C.orange)}}\\right)^{${colorWrap(fracToLatex(absExp), C.blue)}} = \\frac{${colorWrap(num, C.green)}^{${colorWrap(fracToLatex(absExp), C.blue)}}}{${colorWrap(den, C.orange)}^{${colorWrap(fracToLatex(absExp), C.blue)}}}`)
    ));

    let ansLatex: string;
    if (cmd === 'compute' && !isVar) {
      const numVal = safePow(parseInt(num), absExp);
      const denVal = safePow(parseInt(den), absExp);
      if (numVal !== null && denVal !== null) {
        steps.push(step(
          `Langkah ${stepStart + 1}: Hitung nilainya`,
          ``,
          kd(`\\frac{${num}^{${fracToLatex(absExp)}}}{${den}^{${fracToLatex(absExp)}}} = \\frac{${boldWrap(numToLatex(numVal))}}{${boldWrap(numToLatex(denVal))}}`)
        ));
        const [sn, sd] = simplifyFrac(Math.round(numVal), Math.round(denVal));
        ansLatex = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`;
      } else {
        ansLatex = `\\frac{${num}^{${fracToLatex(absExp)}}}{${den}^{${fracToLatex(absExp)}}}`;
      }
    } else {
      ansLatex = `\\frac{${num}^{${fracToLatex(absExp)}}}{${den}^{${fracToLatex(absExp)}}}`;
    }
    
    return { steps, ansLatex, ansMQ: ansLatex, ansText: ansLatex };
  };
  
  let qLatex: string, num: string, den: string, exp: Frac, isVar: boolean;
  
  switch (subId) {
    case '4a': { num = `${b1}`; den = `${b2}`; exp = frac(randInt(2, 4)); isVar = false; break; }
    case '4b': { num = `${b1}`; den = `${b2}`; exp = frac(randInt(-3, -1)); isVar = false; break; }
    case '4c': { num = `${randChoice([4, 9, 16])}`; den = `${randChoice([4, 9, 25])}`; exp = frac(1, 2); isVar = false; break; }
    case '4d': { num = `${b1}`; den = `${b2}`; exp = frac(0); isVar = false; break; }
    case '4e': { num = v1; den = v2; exp = frac(randInt(2, 5)); isVar = true; break; }
    case '4f': { num = v1; den = v2; exp = frac(randInt(-4, -1)); isVar = true; break; }
    case '4g': { num = v1; den = v2; exp = frac(1, 2); isVar = true; break; }
    case '4h': { num = `${b1}`; den = v1; exp = frac(randInt(2, 4)); isVar = true; break; }
    case '4i': { num = v1; den = `${b1}`; exp = frac(randInt(2, 3)); isVar = true; break; }
    case '4j': { num = `${b1}`; den = v1; exp = frac(randInt(-3, -1)); isVar = true; break; }
    case '4k': {
      const e1 = randInt(1, 3), e2 = randInt(1, 3);
      const cmd = pickCommand(false);
      qLatex = `\\left(\\frac{${b1}}{${b2}}\\right)^{${e1}} \\times \\left(\\frac{${b1}}{${b2}}\\right)^{${e2}}`;
      const totalExp = frac(e1 + e2);
      const steps: SolutionStep[] = [];
      steps.push(step('Langkah 1: Gunakan sifat perkalian pangkat', `Karena basisnya sama, pangkatnya dijumlahkan:`, kd(`\\left(\\frac{${b1}}{${b2}}\\right)^{${colorWrap(`${e1}`, C.red)}} \\times \\left(\\frac{${b1}}{${b2}}\\right)^{${colorWrap(`${e2}`, C.blue)}} = \\left(\\frac{${b1}}{${b2}}\\right)^{${colorWrap(`${e1}`, C.red)} + ${colorWrap(`${e2}`, C.blue)}} = \\left(\\frac{${b1}}{${b2}}\\right)^{${boldWrap(`${totalExp.n}`)}}`)));
      let ansLatex = `\\left(\\frac{${b1}}{${b2}}\\right)^{${totalExp.n}}`;
      if (cmd === 'compute') {
        const val = Math.pow(b1, totalExp.n) / Math.pow(b2, totalExp.n);
        if (Number.isFinite(val) && Math.abs(val) <= 10000) {
          const [sn, sd] = simplifyFrac(Math.round(Math.pow(b1, totalExp.n)), Math.round(Math.pow(b2, totalExp.n)));
          ansLatex = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`;
          steps.push(step('Langkah 2: Hitung nilainya', '', kd(`\\frac{${b1}^{${totalExp.n}}}{${b2}^{${totalExp.n}}} = ${boldWrap(ansLatex)}`)));
        }
      }
      return { subtypeId: '4k', topicId: 4, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `(${b1}/${b2})^${e1} × (${b1}/${b2})^${e2}`, answerText: ansLatex, hasVariable: false };
    }
    case '4l': {
      const e1 = randInt(3, 5), e2 = randInt(1, e1 - 1);
      const cmd = pickCommand(false);
      qLatex = `\\left(\\frac{${b1}}{${b2}}\\right)^{${e1}} \\div \\left(\\frac{${b1}}{${b2}}\\right)^{${e2}}`;
      const resExp = e1 - e2;
      const steps: SolutionStep[] = [];
      steps.push(step('Langkah 1: Gunakan sifat pembagian pangkat', `Karena basisnya sama, pangkat dikurangkan:`, kd(`\\left(\\frac{${b1}}{${b2}}\\right)^{${e1}} \\div \\left(\\frac{${b1}}{${b2}}\\right)^{${e2}} = \\left(\\frac{${b1}}{${b2}}\\right)^{${e1} - ${e2}} = \\left(\\frac{${b1}}{${b2}}\\right)^{${boldWrap(`${resExp}`)}}`)));
      let ansLatex = `\\left(\\frac{${b1}}{${b2}}\\right)^{${resExp}}`;
      if (cmd === 'compute') {
        const numVal = Math.pow(b1, resExp), denVal = Math.pow(b2, resExp);
        if (Math.abs(numVal) <= 10000 && Math.abs(denVal) <= 10000) {
          const [sn, sd] = simplifyFrac(Math.round(numVal), Math.round(denVal));
          ansLatex = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`;
          steps.push(step('Langkah 2: Hitung nilainya', '', kd(`\\frac{${b1}^{${resExp}}}{${b2}^{${resExp}}} = ${boldWrap(ansLatex)}`)));
        }
      }
      return { subtypeId: '4l', topicId: 4, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `(${b1}/${b2})^${e1} ÷ (${b1}/${b2})^${e2}`, answerText: ansLatex, hasVariable: false };
    }
    case '4m': {
      const e1 = randInt(2, 3), e2 = randInt(2, 3);
      const cmd = pickCommand(false);
      qLatex = `\\left(\\left(\\frac{${b1}}{${b2}}\\right)^{${e1}}\\right)^{${e2}}`;
      const resExp = e1 * e2;
      const steps: SolutionStep[] = [];
      steps.push(step('Langkah 1: Gunakan sifat pangkat dari pangkat', `Pangkat dikalikan:`, kd(`\\left(\\left(\\frac{${b1}}{${b2}}\\right)^{${colorWrap(`${e1}`, C.red)}}\\right)^{${colorWrap(`${e2}`, C.blue)}} = \\left(\\frac{${b1}}{${b2}}\\right)^{${colorWrap(`${e1}`, C.red)} \\times ${colorWrap(`${e2}`, C.blue)}} = \\left(\\frac{${b1}}{${b2}}\\right)^{${boldWrap(`${resExp}`)}}`)));
      let ansLatex = `\\left(\\frac{${b1}}{${b2}}\\right)^{${resExp}}`;
      if (cmd === 'compute') {
        const numVal = Math.pow(b1, resExp), denVal = Math.pow(b2, resExp);
        if (Math.abs(numVal) <= 10000 && Math.abs(denVal) <= 10000) {
          const [sn, sd] = simplifyFrac(Math.round(numVal), Math.round(denVal));
          ansLatex = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`;
          steps.push(step('Langkah 2: Hitung nilainya', '', kd(`\\frac{${b1}^{${resExp}}}{${b2}^{${resExp}}} = ${boldWrap(ansLatex)}`)));
        }
      }
      return { subtypeId: '4m', topicId: 4, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `((${b1}/${b2})^${e1})^${e2}`, answerText: ansLatex, hasVariable: false };
    }
    default: { num = `${b1}`; den = `${b2}`; exp = frac(2); isVar = false; break; }
  }
  
  const cmd = pickCommand(isVar);
  qLatex = `\\left(\\frac{${num}}{${den}}\\right)^{${fracToLatex(exp)}}`;
  const result = genFracPow(num, den, exp, isVar, cmd);
  return { subtypeId: subId, topicId: 4, commandType: cmd, questionLatex: qLatex, answerLatex: result.ansLatex, answerMQ: result.ansMQ, solutionSteps: result.steps, questionText: `(${num}/${den})^${fracToStr(exp)}`, answerText: result.ansText, hasVariable: isVar };
}

function genTopic5(subId: string): Question {
  const b = randInt(2, 5);
  const steps: SolutionStep[] = [];
  let qLatex: string, ansLatex: string, ansText: string;
  const cmd: CommandType = 'compute';

  switch (subId) {
    case '5a': {
      const e = randChoice([2, 4, 6]);
      qLatex = `(-${b})^{${e}}`;
      const val = Math.pow(b, e);
      steps.push(step('Langkah 1: Perhatikan pangkat genap', `Pangkat ${k(colorWrap(`${e}`, C.blue))} adalah bilangan genap. Bilangan negatif dipangkatkan genap menghasilkan bilangan positif.`, kd(`(${colorWrap(`-${b}`, C.green)})^{${colorWrap(`${e}`, C.blue)}} = ${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e}`, C.blue)}}`))); 
      steps.push(step('Langkah 2: Hitung nilainya', '', kd(`${b}^{${e}} = ${boldWrap(`${val}}`)}`)));
      ansLatex = `${val}`; ansText = `${val}`;
      break;
    }
    case '5b': {
      const e = randChoice([3, 5]);
      qLatex = `(-${b})^{${e}}`;
      const val = -Math.pow(b, e);
      steps.push(step('Langkah 1: Perhatikan pangkat ganjil', `Pangkat ${k(colorWrap(`${e}`, C.blue))} adalah bilangan ganjil. Bilangan negatif dipangkatkan ganjil menghasilkan bilangan negatif.`, kd(`(${colorWrap(`-${b}`, C.green)})^{${colorWrap(`${e}`, C.blue)}} = -${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e}`, C.blue)}}`))); 
      steps.push(step('Langkah 2: Hitung nilainya', '', kd(`-${b}^{${e}} = ${boldWrap(`${val}}`)}`)));
      ansLatex = `${val}`; ansText = `${val}`;
      break;
    }
    case '5c': {
      qLatex = `(-${b})^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Bilangan apapun (kecuali 0) berpangkat nol hasilnya 1:`, kd(`(${colorWrap(`-${b}`, C.green)})^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1';
      break;
    }
    case '5d': {
      qLatex = `(-${b})^{1}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat satu', `Bilangan apapun berpangkat 1 hasilnya bilangan itu sendiri:`, kd(`(${colorWrap(`-${b}`, C.green)})^{${colorWrap('1', C.red)}} = ${boldWrap(`-${b}`)}`))); 
      ansLatex = `-${b}`; ansText = `-${b}`;
      break;
    }
    case '5e': {
      const e1 = randInt(2, 3), e2 = randInt(1, 2);
      qLatex = `(-${b})^{${e1}} \\times (-${b})^{${e2}}`;
      const totalE = e1 + e2;
      const val = Math.pow(-b, totalE);
      steps.push(step('Langkah 1: Gunakan sifat perkalian pangkat', `Basisnya sama yaitu ${k(`(-${b})`)}, pangkatnya dijumlahkan:`, kd(`(-${b})^{${colorWrap(`${e1}`, C.red)}} \\times (-${b})^{${colorWrap(`${e2}`, C.blue)}} = (-${b})^{${colorWrap(`${e1}`, C.red)} + ${colorWrap(`${e2}`, C.blue)}} = (-${b})^{${boldWrap(`${totalE}`)}}`)));
      steps.push(step('Langkah 2: Hitung nilainya', `Pangkat ${totalE} ${totalE % 2 === 0 ? '(genap) → positif' : '(ganjil) → negatif'}`, kd(`(-${b})^{${totalE}} = ${boldWrap(`${val}`)}`))); 
      ansLatex = `${val}`; ansText = `${val}`;
      break;
    }
    case '5f': {
      const e1 = randInt(3, 5), e2 = randInt(1, 2);
      qLatex = `(-${b})^{${e1}} \\div (-${b})^{${e2}}`;
      const resE = e1 - e2;
      const val = Math.pow(-b, resE);
      steps.push(step('Langkah 1: Gunakan sifat pembagian pangkat', `Basisnya sama, pangkat dikurangkan:`, kd(`(-${b})^{${e1}} \\div (-${b})^{${e2}} = (-${b})^{${e1} - ${e2}} = (-${b})^{${boldWrap(`${resE}`)}}`)));
      steps.push(step('Langkah 2: Hitung nilainya', '', kd(`(-${b})^{${resE}} = ${boldWrap(`${val}`)}`))); 
      ansLatex = `${val}`; ansText = `${val}`;
      break;
    }
    case '5g': {
      const e = randInt(-3, -1);
      qLatex = `(-${b})^{${e}}`;
      const posE = -e;
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif', `Pangkat negatif dipindahkan ke penyebut:`, kd(`(-${b})^{${colorWrap(`${e}`, C.red)}} = \\frac{1}{(-${b})^{${colorWrap(`${posE}`, C.blue)}}}`)));
      const denomVal = Math.pow(-b, posE);
      steps.push(step('Langkah 2: Hitung penyebutnya', `Pangkat ${posE} ${posE % 2 === 0 ? '(genap) → positif' : '(ganjil) → negatif'}`, kd(`(-${b})^{${posE}} = ${boldWrap(`${denomVal}`)}`))); 
      const [sn, sd] = simplifyFrac(1, Math.round(denomVal));
      ansLatex = sd === 1 ? `${sn}` : (sn < 0 ? `-\\frac{${Math.abs(sn)}}{${Math.abs(sd)}}` : `\\frac{${sn}}{${sd}}`);
      ansText = ansLatex;
      break;
    }
    case '5h': {
      const e = randChoice([2, 4]);
      qLatex = `(-${b})^{${e}} \\text{ dan } -${b}^{${e}}`;
      const val1 = Math.pow(b, e); // (-b)^even = positive
      const val2 = -Math.pow(b, e); // -(b^even) = negative
      steps.push(step('Langkah 1: Hitung (-' + b + ')^' + e, `Tanda negatif ada di DALAM kurung, sehingga termasuk basis. Pangkat genap menghasilkan positif:`, kd(`(${colorWrap(`-${b}`, C.green)})^{${e}} = ${boldWrap(`${val1}`)}`)));
      steps.push(step('Langkah 2: Hitung -' + b + '^' + e, `Tanda negatif ada di LUAR pangkat, sehingga bukan bagian basis. Kita hitung ${b}^${e} dulu lalu beri tanda negatif:`, kd(`-${colorWrap(`${b}`, C.orange)}^{${e}} = -(${b}^{${e}}) = -(${val1}) = ${boldWrap(`${val2}`)}`)));
      ansLatex = `${val1} \\text{ dan } ${val2}`; ansText = `${val1} dan ${val2}`;
      break;
    }
    default: {
      qLatex = `(-${b})^{2}`;
      const val = b * b;
      steps.push(step('Langkah 1: Hitung', '', kd(`(-${b})^2 = ${val}`))); 
      ansLatex = `${val}`; ansText = `${val}`;
    }
  }
  
  return { subtypeId: subId, topicId: 5, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: false };
}

function genTopic6(subId: string): Question {
  const steps: SolutionStep[] = [];
  let qLatex: string, ansLatex: string, ansText: string;
  
  switch (subId) {
    case '6a': {
      // Angka biasa
      const b = randBase(), e = randInt(2, 4);
      const cmd = pickCommand(false);
      qLatex = `${b}^{-${e}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif', `Pangkat negatif artinya bilangan dipindahkan ke penyebut dan pangkatnya menjadi positif:`, kd(`${colorWrap(`${b}`, C.green)}^{${colorWrap(`-${e}`, C.red)}} = \\frac{1}{${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e}`, C.blue)}}}`)));
      if (cmd === 'compute') {
        const val = Math.pow(b, e);
        steps.push(step('Langkah 2: Hitung nilainya', '', kd(`${b}^{${e}} = ${boldWrap(`${val}`)} \\quad \\Rightarrow \\quad \\frac{1}{${boldWrap(`${val}`)}}`)));
        ansLatex = `\\frac{1}{${val}}`; ansText = `1/${val}`;
      } else {
        ansLatex = `\\frac{1}{${b}^{${e}}}`; ansText = `1/${b}^${e}`;
      }
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(-${e})`, answerText: ansText, hasVariable: false };
    }
    case '6b': {
      // Variabel
      const v = randVar(), e = randInt(2, 5);
      qLatex = `${v}^{-${e}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif', `Pangkat negatif artinya dipindahkan ke penyebut:`, kd(`${colorWrap(v, C.green)}^{${colorWrap(`-${e}`, C.red)}} = \\frac{1}{${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.blue)}}}`)));
      ansLatex = `\\frac{1}{${v}^{${e}}}`; ansText = `1/${v}^${e}`;
      return { subtypeId: subId, topicId: 6, commandType: 'simplify', questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${v}^(-${e})`, answerText: ansText, hasVariable: true };
    }
    case '6c': {
      // Basis pecahan angka
      const a = randInt(2, 5), b = randInt(2, 5), e = randInt(2, 3);
      const cmd = pickCommand(false);
      qLatex = `\\left(\\frac{${a}}{${b}}\\right)^{-${e}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif pada pecahan', `Pangkat negatif membalik pecahan:`, kd(`\\left(\\frac{${colorWrap(`${a}`, C.green)}}{${colorWrap(`${b}`, C.orange)}}\\right)^{${colorWrap(`-${e}`, C.red)}} = \\left(\\frac{${colorWrap(`${b}`, C.orange)}}{${colorWrap(`${a}`, C.green)}}\\right)^{${colorWrap(`${e}`, C.blue)}}`)));
      steps.push(step('Langkah 2: Terapkan pangkat ke pembilang dan penyebut', ``, kd(`\\left(\\frac{${b}}{${a}}\\right)^{${e}} = \\frac{${b}^{${e}}}{${a}^{${e}}}`)));
      if (cmd === 'compute') {
        const numVal = Math.pow(b, e), denVal = Math.pow(a, e);
        const [sn, sd] = simplifyFrac(numVal, denVal);
        steps.push(step('Langkah 3: Hitung nilainya', '', kd(`\\frac{${b}^{${e}}}{${a}^{${e}}} = \\frac{${numVal}}{${denVal}}${sn !== numVal || sd !== denVal ? ` = \\frac{${sn}}{${sd}}` : ''}`)));
        ansLatex = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`; ansText = sd === 1 ? `${sn}` : `${sn}/${sd}`;
      } else {
        ansLatex = `\\frac{${b}^{${e}}}{${a}^{${e}}}`; ansText = `${b}^${e}/${a}^${e}`;
      }
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `(${a}/${b})^(-${e})`, answerText: ansText, hasVariable: false };
    }
    case '6d': {
      // Basis pecahan variabel
      const v1 = randVar(), v2 = randChoice(['a','b','x','y'].filter(c => c !== v1)), e = randInt(2, 4);
      qLatex = `\\left(\\frac{${v1}}{${v2}}\\right)^{-${e}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif pada pecahan', `Pangkat negatif membalik pecahan:`, kd(`\\left(\\frac{${colorWrap(v1, C.green)}}{${colorWrap(v2, C.orange)}}\\right)^{${colorWrap(`-${e}`, C.red)}} = \\left(\\frac{${colorWrap(v2, C.orange)}}{${colorWrap(v1, C.green)}}\\right)^{${colorWrap(`${e}`, C.blue)}}`)));
      steps.push(step('Langkah 2: Terapkan pangkat', ``, kd(`\\left(\\frac{${v2}}{${v1}}\\right)^{${e}} = \\frac{${v2}^{${e}}}{${v1}^{${e}}}`)));
      ansLatex = `\\frac{${v2}^{${e}}}{${v1}^{${e}}}`; ansText = `${v2}^${e}/${v1}^${e}`;
      return { subtypeId: subId, topicId: 6, commandType: 'simplify', questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `(${v1}/${v2})^(-${e})`, answerText: ansText, hasVariable: true };
    }
    case '6e': {
      // Gabungan perkalian
      const b = randBase(), e1 = randInt(-4, -2), e2 = randInt(3, 6);
      const cmd = pickCommand(false);
      qLatex = `${b}^{${e1}} \\times ${b}^{${e2}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildMultSolution([`${b}`, `${b}`], [frac(e1), frac(e2)], false, cmd, qLatex);
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `${b}^(${e1}) × ${b}^${e2}`, answerText: at, hasVariable: false };
    }
    case '6f': {
      // Gabungan pembagian
      const b = randBase(), e1 = randInt(-4, -1), e2 = randInt(-5, -2);
      const cmd = pickCommand(false);
      qLatex = `${b}^{${e1}} \\div ${b}^{${e2}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildDivSolution([`${b}`], [frac(e1)], [`${b}`], [frac(e2)], false, cmd);
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `${b}^(${e1}) ÷ ${b}^(${e2})`, answerText: at, hasVariable: false };
    }
    case '6g': {
      // Gabungan pangkat dari pangkat
      const b = randBase(), e1 = randInt(-3, -1), e2 = randInt(-3, -1);
      const cmd = pickCommand(false);
      qLatex = `\\left(${b}^{${e1}}\\right)^{${e2}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildPowerOfPowerSolution(`${b}`, frac(e1), frac(e2), false, cmd);
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `(${b}^(${e1}))^(${e2})`, answerText: at, hasVariable: false };
    }
    case '6h': {
      // Hasil jadi pecahan biasa
      const b = randBase(), e = randInt(2, 3);
      const cmd: CommandType = 'compute';
      qLatex = `${b}^{-${e}}`;
      const val = Math.pow(b, e);
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif', `Pangkat negatif dipindahkan ke penyebut:`, kd(`${b}^{-${e}} = \\frac{1}{${b}^{${e}}}`)));
      steps.push(step('Langkah 2: Hitung nilainya', '', kd(`\\frac{1}{${b}^{${e}}} = \\frac{1}{${boldWrap(`${val}`)}}`)));
      ansLatex = `\\frac{1}{${val}}`; ansText = `1/${val}`;
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(-${e})`, answerText: ansText, hasVariable: false };
    }
    case '6i': {
      // Gabungan perkalian dan pembagian
      const b = randBase(), e1 = randInt(-3, -1), e2 = randInt(2, 4), e3 = randInt(-2, -1);
      const cmd = pickCommand(false);
      qLatex = `\\frac{${b}^{${e1}} \\times ${b}^{${e2}}}{${b}^{${e3}}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildDivSolution([`${b}`, `${b}`], [frac(e1), frac(e2)], [`${b}`], [frac(e3)], false, cmd);
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `(${b}^(${e1}) × ${b}^${e2}) ÷ ${b}^(${e3})`, answerText: at, hasVariable: false };
    }
    case '6j': {
      // Multi variabel
      const [v1, v2] = randVarPair(), e1 = randInt(-4, -1), e2 = randInt(-3, -1);
      qLatex = `${v1}^{${e1}} \\times ${v2}^{${e2}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif untuk setiap variabel', ``, kd(`${colorWrap(v1, C.green)}^{${colorWrap(`${e1}`, C.red)}} = \\frac{1}{${colorWrap(v1, C.green)}^{${-e1}}}`)));
      steps.push(step('Langkah 2: Lanjutkan untuk variabel kedua', ``, kd(`${colorWrap(v2, C.orange)}^{${colorWrap(`${e2}`, C.blue)}} = \\frac{1}{${colorWrap(v2, C.orange)}^{${-e2}}}`)));
      steps.push(step('Langkah 3: Gabungkan hasil', ``, kd(`\\frac{1}{${v1}^{${-e1}}} \\times \\frac{1}{${v2}^{${-e2}}} = \\frac{1}{${v1}^{${-e1}} \\times ${v2}^{${-e2}}}`)));
      ansLatex = `\\frac{1}{${v1}^{${-e1}} \\times ${v2}^{${-e2}}}`; ansText = `1/(${v1}^${-e1} × ${v2}^${-e2})`;
      return { subtypeId: subId, topicId: 6, commandType: 'simplify', questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${v1}^(${e1}) × ${v2}^(${e2})`, answerText: ansText, hasVariable: true };
    }
    default: {
      const b = randBase(), e = randInt(2, 3);
      const cmd = pickCommand(false);
      qLatex = `${b}^{-${e}}`;
      const val = Math.pow(b, e);
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif', `Pangkat negatif memindahkan ke penyebut:`, kd(`${b}^{-${e}} = \\frac{1}{${b}^{${e}}}`))); 
      if (cmd === 'compute') {
        steps.push(step('Langkah 2: Hitung', '', kd(`\\frac{1}{${b}^{${e}}} = \\frac{1}{${boldWrap(`${val}`)}}`)));
      }
      ansLatex = cmd === 'compute' ? `\\frac{1}{${val}}` : `\\frac{1}{${b}^{${e}}}`;
      ansText = cmd === 'compute' ? `1/${val}` : `1/${b}^${e}`;
      return { subtypeId: subId, topicId: 6, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(-${e})`, answerText: ansText, hasVariable: false };
    }
  }
}

function genTopic7(subId: string): Question {
  const steps: SolutionStep[] = [];
  let qLatex: string, ansLatex: string, ansText: string;
  const cmd: CommandType = 'compute';

  switch (subId) {
    case '7a': {
      // Angka biasa
      const b = randBase();
      qLatex = `${b}^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Bilangan apapun (kecuali 0) berpangkat nol hasilnya 1:`, kd(`${colorWrap(`${b}`, C.green)}^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7b': {
      // Variabel
      const v = randVar();
      qLatex = `${v}^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Variabel apapun (≠ 0) berpangkat nol hasilnya 1:`, kd(`${colorWrap(v, C.green)}^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7c': {
      // Ekspresi perkalian dalam kurung
      const b1 = randBase(), b2 = randBase();
      const e1 = randInt(2, 4), e2 = randInt(2, 4);
      qLatex = `(${b1}^{${e1}} \\times ${b2}^{${e2}})^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Ekspresi apapun berpangkat nol hasilnya 1 (selama ekspresi ≠ 0):`, kd(`(${b1}^{${e1}} \\times ${b2}^{${e2}})^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7d': {
      // Pecahan
      const b1 = randInt(2, 5), b2 = randInt(2, 7);
      qLatex = `\\left(\\frac{${b1}}{${b2}}\\right)^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Pecahan apapun (≠ 0) berpangkat nol hasilnya 1:`, kd(`\\left(\\frac{${b1}}{${b2}}\\right)^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7e': {
      // Bilangan negatif
      const b = randBase();
      qLatex = `(-${b})^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Bilangan negatif berpangkat nol juga hasilnya 1:`, kd(`(${colorWrap(`-${b}`, C.green)})^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7f': {
      // Gabungan dengan perkalian
      const b = randBase(), e = randInt(2, 4);
      qLatex = `${b}^{${e}} \\times ${b}^{0}`;
      steps.push(step('Langkah 1: Selesaikan pangkat nol', `${k(`${b}^{0} = 1`)}, sehingga:`, kd(`${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e}`, C.red)}} \\times ${colorWrap(`${b}`, C.green)}^{${colorWrap('0', C.blue)}} = ${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e}`, C.red)}} \\times 1 = ${colorWrap(`${b}`, C.green)}^{${colorWrap(`${e}`, C.red)}}`))); 
      const val = Math.pow(b, e);
      steps.push(step('Langkah 2: Hitung nilainya', '', kd(`${b}^{${e}} = ${boldWrap(`${val}`)}`)));
      ansLatex = `${val}`; ansText = `${val}`; break;
    }
    case '7g': {
      // Gabungan dengan pembagian (hasil nol)
      const v = randVar(), e = randInt(2, 5);
      qLatex = `${v}^{${e}} \\div ${v}^{${e}}`;
      steps.push(step('Langkah 1: Gunakan sifat pembagian pangkat', `Basisnya sama, pangkat dikurangkan:`, kd(`${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.red)}} \\div ${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.blue)}} = ${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.red)} - ${colorWrap(`${e}`, C.blue)}} = ${colorWrap(v, C.green)}^{${boldWrap('0')}}`))); 
      steps.push(step('Langkah 2: Gunakan sifat pangkat nol', `Hasilnya 1`, kd(`${v}^{0} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7h': {
      // Gabungan lebih kompleks
      const b = randBase(), e1 = randInt(2, 4), e2 = randInt(-3, -1);
      qLatex = `${b}^{${e1}} \\times ${b}^{0} \\times ${b}^{${e2}}`;
      const totalE = e1 + e2;
      steps.push(step('Langkah 1: Selesaikan pangkat nol', `${k(`${b}^{0} = 1`)}`, kd(`${b}^{${e1}} \\times ${b}^{0} \\times ${b}^{${e2}} = ${b}^{${e1}} \\times 1 \\times ${b}^{${e2}} = ${b}^{${e1}} \\times ${b}^{${e2}}`)));
      steps.push(step('Langkah 2: Gunakan sifat perkalian pangkat', `Pangkat dijumlahkan:`, kd(`${b}^{${colorWrap(`${e1}`, C.red)}} \\times ${b}^{${colorWrap(`${e2}`, C.blue)}} = ${b}^{${colorWrap(`${e1}`, C.red)} + (${colorWrap(`${e2}`, C.blue)})} = ${b}^{${boldWrap(`${totalE}`)}}`)));
      if (totalE >= 0) {
        const val = Math.pow(b, totalE);
        steps.push(step('Langkah 3: Hitung nilainya', '', kd(`${b}^{${totalE}} = ${boldWrap(`${val}`)}`)));
        ansLatex = `${val}`; ansText = `${val}`;
      } else {
        const val = Math.pow(b, -totalE);
        steps.push(step('Langkah 3: Gunakan sifat pangkat negatif', '', kd(`${b}^{${totalE}} = \\frac{1}{${b}^{${-totalE}}} = \\frac{1}{${boldWrap(`${val}`)}}`)));
        ansLatex = `\\frac{1}{${val}}`; ansText = `1/${val}`;
      }
      break;
    }
    case '7i': {
      // Ekspresi variabel dalam kurung
      const [v1, v2] = randVarPair();
      const e1 = randInt(2, 4), e2 = randInt(-3, -1);
      qLatex = `(${v1}^{${e1}} \\times ${v2}^{${e2}})^{0}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat nol', `Ekspresi apapun berpangkat nol hasilnya 1:`, kd(`(${colorWrap(v1, C.green)}^{${e1}} \\times ${colorWrap(v2, C.orange)}^{${e2}})^{${colorWrap('0', C.red)}} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
    case '7j': {
      // Gabungan pangkat nol lebih dari satu
      const b = randBase(), e = randInt(2, 4);
      qLatex = `${b}^{0} \\times 5^{0} \\times ${b}^{${e}}`;
      steps.push(step('Langkah 1: Selesaikan semua pangkat nol', `${k(`${b}^{0} = 1`)} dan ${k(`5^{0} = 1`)}`, kd(`${b}^{0} \\times 5^{0} \\times ${b}^{${e}} = 1 \\times 1 \\times ${b}^{${e}} = ${b}^{${e}}`)));
      const val = Math.pow(b, e);
      steps.push(step('Langkah 2: Hitung nilainya', '', kd(`${b}^{${e}} = ${boldWrap(`${val}`)}`)));
      ansLatex = `${val}`; ansText = `${val}`; break;
    }
    case '7k': {
      // Pangkat nol dalam pembagian
      const [v1, v2] = randVarPair();
      const e1 = randInt(2, 5), e2 = randInt(2, 4);
      qLatex = `\\frac{${v1}^{${e1}} \\times ${v2}^{0}}{${v1}^{0} \\times ${v2}^{${e2}}}`;
      steps.push(step('Langkah 1: Selesaikan semua pangkat nol', `${k(`${v2}^{0} = 1`)} dan ${k(`${v1}^{0} = 1`)}`, kd(`\\frac{${v1}^{${e1}} \\times 1}{1 \\times ${v2}^{${e2}}} = \\frac{${v1}^{${e1}}}{${v2}^{${e2}}}`)));
      ansLatex = `\\frac{${v1}^{${e1}}}{${v2}^{${e2}}}`; ansText = `${v1}^${e1}/${v2}^${e2}`;
      return { subtypeId: subId, topicId: 7, commandType: 'simplify', questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: true };
    }
    default: {
      const b = randBase();
      qLatex = `${b}^{0}`;
      steps.push(step('Langkah 1: Pangkat nol', '', kd(`${b}^{0} = ${boldWrap('1')}`))); 
      ansLatex = '1'; ansText = '1'; break;
    }
  }
  
  return { subtypeId: subId, topicId: 7, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: ['7b', '7g', '7i'].includes(subId) };
}

function genTopic8(subId: string): Question {
  const steps: SolutionStep[] = [];
  let qLatex: string, ansLatex: string, ansText: string;

  switch (subId) {
    case '8a': {
      // Akar kuadrat sederhana
      const b = randChoice(PERFECT_SQUARES);
      const root = Math.round(Math.sqrt(b));
      const cmd = pickCommand(false);
      qLatex = `${b}^{\\frac{1}{2}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat pecahan', `Pangkat ${k('\\frac{1}{2}')} artinya akar kuadrat:`, kd(`${colorWrap(`${b}`, C.green)}^{${colorWrap('\\frac{1}{2}', C.red)}} = \\sqrt{${colorWrap(`${b}`, C.green)}}`))); 
      steps.push(step('Langkah 2: Hitung akar kuadrat', `Karena ${k(`${root} \\times ${root} = ${b}`)}`, kd(`\\sqrt{${b}} = ${boldWrap(`${root}`)}`))); 
      ansLatex = `${root}`; ansText = `${root}`;
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(1/2)`, answerText: ansText, hasVariable: false };
    }
    case '8b': {
      // Akar kubik sederhana
      const b = randChoice(PERFECT_CUBES);
      const root = Math.round(Math.pow(b, 1/3));
      const cmd = pickCommand(false);
      qLatex = `${b}^{\\frac{1}{3}}`;
      steps.push(step('Langkah 1: Gunakan sifat pangkat pecahan', `Pangkat ${k('\\frac{1}{3}')} artinya akar kubik:`, kd(`${colorWrap(`${b}`, C.green)}^{${colorWrap('\\frac{1}{3}', C.red)}} = \\sqrt[3]{${colorWrap(`${b}`, C.green)}}`))); 
      steps.push(step('Langkah 2: Hitung akar kubik', `Karena ${k(`${root}^3 = ${b}`)}`, kd(`\\sqrt[3]{${b}} = ${boldWrap(`${root}`)}`))); 
      ansLatex = `${root}`; ansText = `${root}`;
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(1/3)`, answerText: ansText, hasVariable: false };
    }
    case '8c': {
      // Pangkat pecahan pembilang > 1 (basis kecil)
      const b = randChoice([4, 8, 9, 27]);
      const rootIndex = b === 4 || b === 9 ? 2 : 3;
      const numExp = randInt(2, 3);
      const cmd = pickCommand(false);
      qLatex = `${b}^{\\frac{${numExp}}{${rootIndex}}}`;
      const root = Math.round(Math.pow(b, 1/rootIndex));
      const val = Math.pow(root, numExp);
      steps.push(step('Langkah 1: Gunakan sifat pangkat pecahan', `Pangkat pecahan: akar ke-${rootIndex} dari ${b}, lalu dipangkatkan ${numExp}:`, kd(`${b}^{\\frac{${numExp}}{${rootIndex}}} = \\left(\\sqrt[${rootIndex}]{${b}}\\right)^{${numExp}}`))); 
      steps.push(step('Langkah 2: Hitung akar', '', kd(`\\sqrt[${rootIndex}]{${b}} = ${boldWrap(`${root}`)}`))); 
      steps.push(step('Langkah 3: Pangkatkan', '', kd(`${root}^{${numExp}} = ${boldWrap(`${val}`)}`))); 
      ansLatex = `${val}`; ansText = `${val}`;
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(${numExp}/${rootIndex})`, answerText: ansText, hasVariable: false };
    }
    case '8d': {
      // Pangkat pecahan pembilang > 1 (basis lebih besar)
      const b = randChoice([16, 25, 27, 32]);
      const rootIndex = b === 27 ? 3 : 2;
      const numExp = randInt(2, 3);
      const cmd = pickCommand(false);
      qLatex = `${b}^{\\frac{${numExp}}{${rootIndex}}}`;
      const root = Math.round(Math.pow(b, 1/rootIndex));
      const val = Math.pow(root, numExp);
      steps.push(step('Langkah 1: Gunakan sifat pangkat pecahan', `Pangkat pecahan: hitung akar ke-${rootIndex} terlebih dahulu:`, kd(`${b}^{\\frac{${numExp}}{${rootIndex}}} = \\left(${b}^{\\frac{1}{${rootIndex}}}\\right)^{${numExp}} = \\left(\\sqrt[${rootIndex}]{${b}}\\right)^{${numExp}}`))); 
      steps.push(step('Langkah 2: Hitung akar', `Karena ${k(`${root}^{${rootIndex}} = ${b}`)}`, kd(`\\sqrt[${rootIndex}]{${b}} = ${boldWrap(`${root}`)}`))); 
      steps.push(step('Langkah 3: Pangkatkan', '', kd(`${root}^{${numExp}} = ${boldWrap(`${val}`)}`))); 
      ansLatex = `${val}`; ansText = `${val}`;
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(${numExp}/${rootIndex})`, answerText: ansText, hasVariable: false };
    }
    case '8e': {
      // Variabel pangkat pecahan
      const v = randVar();
      const n = randInt(1, 5), d = randChoice([2, 3, 4]);
      qLatex = `${v}^{\\frac{${n}}{${d}}}`;
      steps.push(step('Langkah 1: Interpretasi pangkat pecahan', `${k(`${v}^{\\frac{${n}}{${d}}}`)} berarti akar ke-${d} dari ${v} dipangkatkan ${n}:`, kd(`${v}^{\\frac{${n}}{${d}}} = \\left(\\sqrt[${d}]{${v}}\\right)^{${n}} = \\sqrt[${d}]{${v}^{${n}}}`))); 
      ansLatex = `${v}^{\\frac{${n}}{${d}}}`; ansText = `${v}^(${n}/${d})`;
      return { subtypeId: subId, topicId: 8, commandType: 'simplify', questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${v}^(${n}/${d})`, answerText: ansText, hasVariable: true };
    }
    case '8f': {
      // Gabungan perkalian
      const v = randVar();
      const n1 = 1, d = 2, n2 = randInt(1, 5);
      const cmd: CommandType = 'simplify';
      qLatex = `${v}^{\\frac{${n1}}{${d}}} \\times ${v}^{\\frac{${n2}}{${d}}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildMultSolution([v, v], [frac(n1, d), frac(n2, d)], true, cmd, qLatex);
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `${v}^(${n1}/${d}) × ${v}^(${n2}/${d})`, answerText: at, hasVariable: true };
    }
    case '8g': {
      // Gabungan pembagian
      const v = randVar();
      const n1 = randInt(3, 7), d = randChoice([2, 3]), n2 = randInt(1, n1 - 1);
      const cmd: CommandType = 'simplify';
      qLatex = `${v}^{\\frac{${n1}}{${d}}} \\div ${v}^{\\frac{${n2}}{${d}}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildDivSolution([v], [frac(n1, d)], [v], [frac(n2, d)], true, cmd);
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `${v}^(${n1}/${d}) ÷ ${v}^(${n2}/${d})`, answerText: at, hasVariable: true };
    }
    case '8h': {
      // Gabungan pangkat dari pangkat
      const v = randVar();
      const n1 = 1, d1 = randChoice([2, 3]), e2 = randInt(2, 6);
      const cmd: CommandType = 'simplify';
      qLatex = `\\left(${v}^{\\frac{${n1}}{${d1}}}\\right)^{${e2}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildPowerOfPowerSolution(v, frac(n1, d1), frac(e2), true, cmd);
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `(${v}^(${n1}/${d1}))^${e2}`, answerText: at, hasVariable: true };
    }
    case '8i': {
      // Pangkat pecahan negatif
      const b = randChoice(PERFECT_SQUARES);
      const cmd = pickCommand(false);
      qLatex = `${b}^{-\\frac{1}{2}}`;
      const root = Math.round(Math.sqrt(b));
      steps.push(step('Langkah 1: Gunakan sifat pangkat negatif', `Pangkat negatif dipindahkan ke penyebut:`, kd(`${b}^{-\\frac{1}{2}} = \\frac{1}{${b}^{\\frac{1}{2}}}`)));
      steps.push(step('Langkah 2: Hitung akar kuadrat', '', kd(`${b}^{\\frac{1}{2}} = \\sqrt{${b}} = ${boldWrap(`${root}`)}`)));
      steps.push(step('Langkah 3: Gabungkan hasil', '', kd(`\\frac{1}{${root}}`)));
      ansLatex = `\\frac{1}{${root}}`; ansText = `1/${root}`;
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${b}^(-1/2)`, answerText: ansText, hasVariable: false };
    }
    case '8j': {
      // Basis pecahan dengan pangkat pecahan
      const a = randChoice([4, 9, 16]), b = randChoice([4, 9, 25].filter(x => x !== a));
      const cmd = pickCommand(false);
      qLatex = `\\left(\\frac{${a}}{${b}}\\right)^{\\frac{1}{2}}`;
      const rootA = Math.round(Math.sqrt(a)), rootB = Math.round(Math.sqrt(b));
      steps.push(step('Langkah 1: Terapkan pangkat pecahan ke pembilang dan penyebut', ``, kd(`\\left(\\frac{${a}}{${b}}\\right)^{\\frac{1}{2}} = \\frac{${a}^{\\frac{1}{2}}}{${b}^{\\frac{1}{2}}} = \\frac{\\sqrt{${a}}}{\\sqrt{${b}}}`)));
      steps.push(step('Langkah 2: Hitung akar masing-masing', '', kd(`\\frac{\\sqrt{${a}}}{\\sqrt{${b}}} = \\frac{${boldWrap(`${rootA}`)}}{${boldWrap(`${rootB}`)}}`)));
      const [sn, sd] = simplifyFrac(rootA, rootB);
      if (sn !== rootA || sd !== rootB) {
        steps.push(step('Langkah 3: Sederhanakan pecahan', '', kd(`\\frac{${rootA}}{${rootB}} = \\frac{${sn}}{${sd}}`)));
      }
      ansLatex = sd === 1 ? `${sn}` : `\\frac{${sn}}{${sd}}`; ansText = sd === 1 ? `${sn}` : `${sn}/${sd}`;
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `(${a}/${b})^(1/2)`, answerText: ansText, hasVariable: false };
    }
    case '8k': {
      // Gabungan perkalian dan pembagian
      const v = randVar();
      const n1 = 1, n2 = randInt(3, 5), n3 = randInt(1, 2), d = 2;
      const cmd: CommandType = 'simplify';
      qLatex = `\\frac{${v}^{\\frac{${n1}}{${d}}} \\times ${v}^{\\frac{${n2}}{${d}}}}{${v}^{\\frac{${n3}}{${d}}}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildDivSolution([v, v], [frac(n1, d), frac(n2, d)], [v], [frac(n3, d)], true, cmd);
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `(${v}^(${n1}/${d}) × ${v}^(${n2}/${d})) ÷ ${v}^(${n3}/${d})`, answerText: at, hasVariable: true };
    }
    case '8l': {
      // Multi variabel pangkat pecahan
      const [v1, v2] = randVarPair();
      const n1 = 1, d1 = 2, n2 = 1, d2 = 3;
      qLatex = `${v1}^{\\frac{${n1}}{${d1}}} \\times ${v2}^{\\frac{${n2}}{${d2}}}`;
      steps.push(step('Langkah 1: Identifikasi pangkat pecahan', `Kedua variabel memiliki basis berbeda, sehingga tidak bisa digabung:`, kd(`${colorWrap(v1, C.green)}^{\\frac{${n1}}{${d1}}} \\times ${colorWrap(v2, C.orange)}^{\\frac{${n2}}{${d2}}}`)));
      steps.push(step('Langkah 2: Interpretasi', `${k(`${v1}^{\\frac{1}{2}}`)} = akar kuadrat dari ${v1}, ${k(`${v2}^{\\frac{1}{3}}`)} = akar kubik dari ${v2}`, kd(`\\sqrt{${v1}} \\times \\sqrt[3]{${v2}}`)));
      ansLatex = `${v1}^{\\frac{1}{2}} \\times ${v2}^{\\frac{1}{3}}`; ansText = `${v1}^(1/2) × ${v2}^(1/3)`;
      return { subtypeId: subId, topicId: 8, commandType: 'simplify', questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: `${v1}^(1/2) × ${v2}^(1/3)`, answerText: ansText, hasVariable: true };
    }
    default: {
      const v = randVar();
      const n1 = 1, d1 = 2, n2 = randInt(1, 5), d2 = 2;
      const cmd: CommandType = 'simplify';
      qLatex = `${v}^{\\frac{${n1}}{${d1}}} \\times ${v}^{\\frac{${n2}}{${d2}}}`;
      const { steps: s, ansLatex: al, ansMQ: am, ansText: at } = buildMultSolution([v, v], [frac(n1, d1), frac(n2, d2)], true, cmd, qLatex);
      return { subtypeId: subId, topicId: 8, commandType: cmd, questionLatex: qLatex, answerLatex: al, answerMQ: am, solutionSteps: s, questionText: `${v}^(${n1}/${d1}) × ${v}^(${n2}/${d2})`, answerText: at, hasVariable: true };
    }
  }
}

function genTopic9(subId: string): Question {
  const steps: SolutionStep[] = [];
  let qLatex: string, ansLatex: string, ansText: string;
  const cmd: CommandType = 'simplify';

  switch (subId) {
    case '9a': {
      // Akar kuadrat angka
      const b = randChoice(PERFECT_SQUARES);
      qLatex = `\\sqrt{${b}}`;
      steps.push(step('Langkah 1: Konversi akar kuadrat ke pangkat pecahan', `Akar kuadrat sama dengan pangkat ${k('\\frac{1}{2}')}:`, kd(`\\sqrt{${colorWrap(`${b}`, C.green)}} = ${colorWrap(`${b}`, C.green)}^{${colorWrap('\\frac{1}{2}', C.red)}}`))); 
      ansLatex = `${b}^{\\frac{1}{2}}`; ansText = `${b}^(1/2)`; break;
    }
    case '9b': {
      // Akar kubik angka
      const b = randChoice(PERFECT_CUBES);
      qLatex = `\\sqrt[3]{${b}}`;
      steps.push(step('Langkah 1: Konversi akar kubik ke pangkat pecahan', `Akar kubik sama dengan pangkat ${k('\\frac{1}{3}')}:`, kd(`\\sqrt[3]{${colorWrap(`${b}`, C.green)}} = ${colorWrap(`${b}`, C.green)}^{${colorWrap('\\frac{1}{3}', C.red)}}`))); 
      ansLatex = `${b}^{\\frac{1}{3}}`; ansText = `${b}^(1/3)`; break;
    }
    case '9c': {
      // Akar ke-4 angka
      const b = randChoice([16, 81, 256]);
      qLatex = `\\sqrt[4]{${b}}`;
      steps.push(step('Langkah 1: Konversi akar ke-4 ke pangkat pecahan', `Akar ke-4 sama dengan pangkat ${k('\\frac{1}{4}')}:`, kd(`\\sqrt[4]{${colorWrap(`${b}`, C.green)}} = ${colorWrap(`${b}`, C.green)}^{${colorWrap('\\frac{1}{4}', C.red)}}`))); 
      ansLatex = `${b}^{\\frac{1}{4}}`; ansText = `${b}^(1/4)`; break;
    }
    case '9d': {
      // Akar kuadrat variabel
      const v = randVar(), e = randChoice([2, 4, 6]);
      qLatex = `\\sqrt{${v}^{${e}}}`;
      const resExp = e / 2;
      steps.push(step('Langkah 1: Konversi ke pangkat pecahan', `Akar kuadrat = pangkat ${k('\\frac{1}{2}')}:`, kd(`\\sqrt{${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.red)}}} = \\left(${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.red)}}\\right)^{\\frac{1}{2}}`))); 
      steps.push(step('Langkah 2: Gunakan sifat pangkat dari pangkat', `Pangkat dikalikan:`, kd(`${colorWrap(v, C.green)}^{${colorWrap(`${e}`, C.red)} \\times \\frac{1}{2}} = ${colorWrap(v, C.green)}^{${boldWrap(`${resExp}`)}}`))); 
      ansLatex = resExp === 1 ? v : `${v}^{${resExp}}`; ansText = resExp === 1 ? v : `${v}^${resExp}`; break;
    }
    case '9e': {
      // Akar kubik variabel
      const v = randVar(), e = randChoice([3, 6, 9]);
      qLatex = `\\sqrt[3]{${v}^{${e}}}`;
      const resExp = e / 3;
      steps.push(step('Langkah 1: Konversi ke pangkat pecahan', `Akar kubik = pangkat ${k('\\frac{1}{3}')}:`, kd(`\\sqrt[3]{${v}^{${e}}} = (${v}^{${e}})^{\\frac{1}{3}} = ${v}^{${e} \\times \\frac{1}{3}} = ${v}^{${boldWrap(`${resExp}`)}}`))); 
      ansLatex = resExp === 1 ? v : `${v}^{${resExp}}`; ansText = resExp === 1 ? v : `${v}^${resExp}`; break;
    }
    case '9f': {
      // Akar dengan pangkat di dalam
      const v = randVar(), e = randInt(2, 5);
      qLatex = `\\sqrt[3]{${v}^{${e}}}`;
      const resultFrac = frac(e, 3);
      steps.push(step('Langkah 1: Konversi ke pangkat pecahan', `Akar ke-3 = pangkat ${k('\\frac{1}{3}')}:`, kd(`\\sqrt[3]{${v}^{${e}}} = (${v}^{${e}})^{\\frac{1}{3}}`)));
      steps.push(step('Langkah 2: Gunakan sifat pangkat dari pangkat', `Pangkat dikalikan:`, kd(`${v}^{${e} \\times \\frac{1}{3}} = ${v}^{${fracToLatex(resultFrac)}}`))); 
      ansLatex = `${v}^{${fracToLatex(resultFrac)}}`; ansText = `${v}^(${resultFrac.n}/${resultFrac.d})`; break;
    }
    case '9g': {
      // Akar ke-n campuran multi variabel
      const [v1, v2] = randVarPair();
      const e1 = randChoice([2, 4]), e2 = randChoice([4, 8]);
      const n = 4; // akar ke-4
      qLatex = `\\sqrt[${n}]{${v1}^{${e1}} \\times ${v2}^{${e2}}}`;
      const resE1 = frac(e1, n), resE2 = frac(e2, n);
      steps.push(step('Langkah 1: Konversi akar ke pangkat pecahan', `Akar ke-${n} = pangkat ${k(`\\frac{1}{${n}}`)}:`, kd(`\\sqrt[${n}]{${v1}^{${e1}} \\times ${v2}^{${e2}}} = (${v1}^{${e1}} \\times ${v2}^{${e2}})^{\\frac{1}{${n}}}`)));
      steps.push(step('Langkah 2: Terapkan pangkat ke setiap faktor', ``, kd(`(${v1}^{${e1}})^{\\frac{1}{${n}}} \\times (${v2}^{${e2}})^{\\frac{1}{${n}}} = ${v1}^{\\frac{${e1}}{${n}}} \\times ${v2}^{\\frac{${e2}}{${n}}}`)));
      steps.push(step('Langkah 3: Sederhanakan pangkat', ``, kd(`${v1}^{${fracToLatex(resE1)}} \\times ${v2}^{${fracToLatex(resE2)}}`)));
      ansLatex = `${formatPowLatexSimple(v1, resE1)} \\times ${formatPowLatexSimple(v2, resE2)}`; 
      ansText = `${v1}^(${resE1.n}/${resE1.d}) × ${v2}^(${resE2.n}/${resE2.d})`; break;
    }
    case '9h': {
      // Akar dari pecahan
      const a = randChoice(PERFECT_SQUARES), b = randChoice(PERFECT_SQUARES.filter(x => x !== a));
      qLatex = `\\sqrt{\\frac{${a}}{${b}}}`;
      steps.push(step('Langkah 1: Konversi ke pangkat pecahan', ``, kd(`\\sqrt{\\frac{${a}}{${b}}} = \\left(\\frac{${a}}{${b}}\\right)^{\\frac{1}{2}}`)));
      steps.push(step('Langkah 2: Terapkan pangkat ke pembilang dan penyebut', ``, kd(`\\frac{${a}^{\\frac{1}{2}}}{${b}^{\\frac{1}{2}}} = \\frac{\\sqrt{${a}}}{\\sqrt{${b}}}`)));
      ansLatex = `\\frac{${a}^{\\frac{1}{2}}}{${b}^{\\frac{1}{2}}}`; ansText = `${a}^(1/2) / ${b}^(1/2)`; break;
    }
    case '9i': {
      // Akar dalam akar
      const b = randChoice([16, 81, 256]);
      qLatex = `\\sqrt{\\sqrt{${b}}}`;
      steps.push(step('Langkah 1: Konversi akar dalam ke pangkat pecahan', `Akar dalam: ${k(`\\sqrt{${b}} = ${b}^{\\frac{1}{2}}`)}`, kd(`\\sqrt{${b}^{\\frac{1}{2}}}`)));
      steps.push(step('Langkah 2: Konversi akar luar ke pangkat pecahan', ``, kd(`\\left(${b}^{\\frac{1}{2}}\\right)^{\\frac{1}{2}}`)));
      steps.push(step('Langkah 3: Gunakan sifat pangkat dari pangkat', `Pangkat dikalikan:`, kd(`${b}^{\\frac{1}{2} \\times \\frac{1}{2}} = ${b}^{\\frac{1}{4}}`)));
      ansLatex = `${b}^{\\frac{1}{4}}`; ansText = `${b}^(1/4)`; break;
    }
    case '9j': {
      // Akar dari bilangan berpangkat
      const b = randBase(), e = randChoice([4, 6, 8]);
      qLatex = `\\sqrt[3]{${b}^{${e}}}`;
      const resultFrac = frac(e, 3);
      steps.push(step('Langkah 1: Konversi akar kubik ke pangkat pecahan', ``, kd(`\\sqrt[3]{${b}^{${e}}} = (${b}^{${e}})^{\\frac{1}{3}}`)));
      steps.push(step('Langkah 2: Gunakan sifat pangkat dari pangkat', `Pangkat dikalikan:`, kd(`${b}^{${e} \\times \\frac{1}{3}} = ${b}^{${fracToLatex(resultFrac)}}`)));
      ansLatex = `${b}^{${fracToLatex(resultFrac)}}`; ansText = `${b}^(${resultFrac.n}/${resultFrac.d})`; break;
    }
    case '9k': {
      // Akar dari bilangan berpangkat negatif
      const v = randVar(), e = randChoice([-2, -4, -6]);
      qLatex = `\\sqrt{${v}^{${e}}}`;
      const resExp = frac(e, 2);
      steps.push(step('Langkah 1: Konversi akar kuadrat ke pangkat pecahan', ``, kd(`\\sqrt{${v}^{${e}}} = (${v}^{${e}})^{\\frac{1}{2}}`)));
      steps.push(step('Langkah 2: Gunakan sifat pangkat dari pangkat', `Pangkat dikalikan:`, kd(`${v}^{${e} \\times \\frac{1}{2}} = ${v}^{${fracToLatex(resExp)}}`)));
      steps.push(step('Langkah 3: Sederhanakan pangkat negatif', `Pangkat negatif dipindahkan ke penyebut:`, kd(`${v}^{${fracToLatex(resExp)}} = \\frac{1}{${v}^{${-resExp.n}}}`)));
      ansLatex = `\\frac{1}{${v}^{${-resExp.n}}}`; ansText = `1/${v}^${-resExp.n}`; break;
    }
    case '9l': {
      // Akar campuran angka dan variabel
      const b = randChoice([4, 8, 27]), v = randVar(), e = randChoice([3, 6]);
      const n = b === 27 || b === 8 ? 3 : 2;
      qLatex = `\\sqrt[${n}]{${b} \\times ${v}^{${e}}}`;
      const rootB = Math.round(Math.pow(b, 1/n));
      const resExp = frac(e, n);
      steps.push(step('Langkah 1: Konversi akar ke pangkat pecahan', ``, kd(`\\sqrt[${n}]{${b} \\times ${v}^{${e}}} = (${b} \\times ${v}^{${e}})^{\\frac{1}{${n}}}`)));
      steps.push(step('Langkah 2: Terapkan pangkat ke setiap faktor', ``, kd(`${b}^{\\frac{1}{${n}}} \\times (${v}^{${e}})^{\\frac{1}{${n}}} = ${b}^{\\frac{1}{${n}}} \\times ${v}^{\\frac{${e}}{${n}}}`)));
      steps.push(step('Langkah 3: Hitung nilai akar angka dan sederhanakan', `${k(`${b}^{\\frac{1}{${n}}} = \\sqrt[${n}]{${b}} = ${rootB}`)}`, kd(`${boldWrap(`${rootB}`)} \\times ${v}^{${fracToLatex(resExp)}}`)));
      const vPart = fracEq(resExp, frac(1)) ? v : `${v}^{${fracToLatex(resExp)}}`;
      ansLatex = `${rootB} \\times ${vPart}`; ansText = `${rootB} × ${v}^(${resExp.n}/${resExp.d})`; break;
    }
    default: {
      const v = randVar();
      const e = randChoice([2, 4, 6]);
      qLatex = `\\sqrt{${v}^{${e}}}`;
      const resExp = e / 2;
      steps.push(step('Langkah 1: Konversi ke pangkat pecahan', '', kd(`\\sqrt{${v}^{${e}}} = ${v}^{${e}/2} = ${v}^{${boldWrap(`${resExp}`)}}`))); 
      ansLatex = resExp === 1 ? v : `${v}^{${resExp}}`; ansText = resExp === 1 ? v : `${v}^${resExp}`; break;
    }
  }
  
  return { subtypeId: subId, topicId: 9, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansLatex, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: ['9d','9e','9f','9g','9k','9l'].includes(subId) };
}

// ========================================
// TOPIC 10: Campuran
// ========================================
function genTopic10(subId: string): Question {
  // For mixed topics, we generate combinations of the basic operations
  switch (subId) {
    case '10a': return genMixed(2);
    case '10b': return genMixed(3);
    case '10c': return genMixed(4);
    case '10d': return genMixedComplex('denom');
    case '10e': return genMixedComplex('both');
    default: return genMixed(2);
  }
}

function genMixed(numProperties: number): Question {
  // Pick random properties to combine
  // For simplicity, generate a multi-operation expression
  const v = randVar();
  const b = randBase();
  const useVar = randChoice([true, false]);
  const base = useVar ? v : `${b}`;
  const cmd = pickCommand(useVar);
  
  // Generate exponents based on numProperties
  const exps: Frac[] = [];
  
  for (let i = 0; i < numProperties; i++) {
    const type = randChoice(['pos', 'neg', 'zero', 'frac']);
    switch (type) {
      case 'pos': exps.push(frac(randInt(1, 4))); break;
      case 'neg': exps.push(frac(randInt(-4, -1))); break;
      case 'zero': exps.push(frac(0)); break;
      case 'frac': exps.push(frac(1, randChoice([2, 3]))); break;
    }
  }
  
  // Build expression: multiplication and division
  const useDivision = numProperties >= 2 && randChoice([true, false]);
  let numBases: string[] = [];
  let numExps: Frac[] = [];
  let denBases: string[] = [];
  let denExps: Frac[] = [];
  
  // Helper to format term (hide ^1)
  const formatTerm = (b: string, e: Frac) => {
    if (fracEq(e, frac(1))) return b;
    if (fracEq(e, frac(0))) return `${b}^{0}`;
    return `${b}^{${fracToLatex(e)}}`;
  };

  if (useDivision) {
    const splitAt = randInt(1, exps.length - 1);
    for (let i = 0; i < exps.length; i++) {
      if (i < splitAt) {
        numBases.push(base);
        numExps.push(exps[i]);
      } else {
        denBases.push(base);
        denExps.push(exps[i]);
      }
    }
    const numStr = numBases.map((b, i) => formatTerm(b, numExps[i])).join(' \\times ');
    const denStr = denBases.map((b, i) => formatTerm(b, denExps[i])).join(' \\times ');
    const qLatex = `\\frac{${numStr}}{${denStr}}`;
    const { steps, ansLatex, ansMQ, ansText } = buildDivSolution(numBases, numExps, denBases, denExps, useVar, cmd);
    return { subtypeId: `10${numProperties === 2 ? 'a' : numProperties === 3 ? 'b' : 'c'}`, topicId: 10, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: useVar };
  } else {
    const bases = exps.map(() => base);
    const qLatex = bases.map((b, i) => formatTerm(b, exps[i])).join(' \\times ');
    const { steps, ansLatex, ansMQ, ansText } = buildMultSolution(bases, exps, useVar, cmd, qLatex);
    return { subtypeId: `10${numProperties === 2 ? 'a' : numProperties === 3 ? 'b' : 'c'}`, topicId: 10, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: useVar };
  }
}

function genMixedComplex(type: 'denom' | 'both'): Question {
  const [v1, v2] = randVarPair();
  const cmd: CommandType = 'simplify';
  
  // For 'denom' type: denominator is MORE complex than numerator
  // For 'both' type: both are complex
  const numCount = type === 'both' ? randInt(3, 4) : randInt(1, 2);
  const denCount = type === 'denom' ? randInt(3, 5) : randInt(3, 4);
  
  const numBases: string[] = [], numExps: Frac[] = [];
  const denBases: string[] = [], denExps: Frac[] = [];
  
  // Generate numerator - simpler for 'denom' type
  for (let i = 0; i < numCount; i++) {
    numBases.push(randChoice([v1, v2]));
    // For 'denom', use simpler exponents in numerator
    if (type === 'denom') {
      numExps.push(frac(randInt(1, 4)));
    } else {
      numExps.push(frac(randInt(-3, 5), randChoice([1, 1, 2])));
    }
  }
  
  // Generate denominator - more complex
  const denExpTypes = ['pos', 'neg', 'frac', 'zero'];
  for (let i = 0; i < denCount; i++) {
    denBases.push(randChoice([v1, v2]));
    const expType = randChoice(denExpTypes);
    switch (expType) {
      case 'pos': denExps.push(frac(randInt(1, 4))); break;
      case 'neg': denExps.push(frac(randInt(-4, -1))); break;
      case 'frac': denExps.push(frac(randInt(1, 3), randChoice([2, 3]))); break;
      case 'zero': denExps.push(frac(0)); break;
    }
  }
  
  // Build question LaTeX with proper formatting (hide ^1)
  const formatTerm = (b: string, e: Frac) => {
    if (fracEq(e, frac(1))) return b;
    if (fracEq(e, frac(0))) return `${b}^{0}`;
    return `${b}^{${fracToLatex(e)}}`;
  };
  
  const numStr = numBases.map((b, i) => formatTerm(b, numExps[i])).join(' \\times ');
  const denStr = denBases.map((b, i) => formatTerm(b, denExps[i])).join(' \\times ');
  const qLatex = `\\frac{${numStr}}{${denStr}}`;
  
  const { steps, ansLatex, ansMQ, ansText } = buildDivSolution(numBases, numExps, denBases, denExps, true, cmd);
  
  return { subtypeId: type === 'denom' ? '10d' : '10e', topicId: 10, commandType: cmd, questionLatex: qLatex, answerLatex: ansLatex, answerMQ: ansMQ, solutionSteps: steps, questionText: qLatex, answerText: ansText, hasVariable: true };
}

// ========================================
// MAIN GENERATOR
// ========================================
export function generateQuestion(topicId: number, subtypeId: string): Question {
  switch (topicId) {
    case 1: return genTopic1(subtypeId);
    case 2: return genTopic2(subtypeId);
    case 3: return genTopic3(subtypeId);
    case 4: return genTopic4(subtypeId);
    case 5: return genTopic5(subtypeId);
    case 6: return genTopic6(subtypeId);
    case 7: return genTopic7(subtypeId);
    case 8: return genTopic8(subtypeId);
    case 9: return genTopic9(subtypeId);
    case 10: return genTopic10(subtypeId);
    default: return genTopic1('1a');
  }
}
