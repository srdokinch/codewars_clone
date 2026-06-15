export type ProblemType = "execution" | "test";
export type ProblemLevel = "basic" | "advanced";

export interface TestCase {
  input: unknown[];
  expected: unknown;
  description?: string;
}

export interface Problem {
  id: string;
  week: number;
  title: string;
  level: ProblemLevel;
  type: ProblemType;
  question: string;
  starterCode: string;
  answer: string;
  explanation: string;
  learningPoints: string[];
  hints: string[];
  testCases: TestCase[];
  /** test方式で呼び出す関数名（Week5以降で使用） */
  functionName?: string;
}

export interface Week {
  id: number;
  title: string;
  description: string;
  topics: string[];
}

export interface RunResult {
  success: boolean;
  message: string;
  details?: string[];
  error?: string;
  testResults?: TestCaseResult[];
}

export interface TestCaseResult {
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  description?: string;
  error?: string;
}

export interface TestRunResult extends RunResult {
  testResults: TestCaseResult[];
}
