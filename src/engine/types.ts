import { Frac } from '../utils/helpers';

export type CommandType = 'simplify' | 'compute';

export interface Question {
  subtypeId: string;
  topicId: number;
  commandType: CommandType;
  questionLatex: string;  // The question in LaTeX
  answerLatex: string;    // Expected answer in LaTeX for display
  answerMQ: string;       // Canonical answer for MQ comparison
  solutionSteps: SolutionStep[];
  questionText: string;   // Plain text version for spreadsheet
  answerText: string;     // Plain text answer for spreadsheet
  hasVariable: boolean;   // If true, commandType is always 'simplify'
}

export interface SolutionStep {
  title: string;
  content: string;  // HTML with KaTeX
  math?: string;    // Optional centered math line (KaTeX HTML)
}

// Internal representation of a term in an expression
export interface Term {
  base: string;       // e.g. "2", "a", "x"
  exp: Frac;
  isNegBase?: boolean; // for (-2)^n type
}

export interface FractionBase {
  num: string;  // numerator base
  den: string;  // denominator base
}
