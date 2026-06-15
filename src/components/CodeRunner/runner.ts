import type { Problem, RunResult } from "@/types";

export interface CodeRunnerStrategy {
  type: Problem["type"];
  run: (code: string, problem: Problem) => RunResult;
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function valuesEqual(actual: unknown, expected: unknown): boolean {
  return formatValue(actual) === formatValue(expected);
}

/** console.logの出力をキャプチャして実行する */
export function runExecutionCode(
  code: string,
  problem: Problem
): RunResult {
  const logs: string[] = [];

  const captureConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(formatValue).join(" "));
    },
    warn: (...args: unknown[]) => {
      logs.push(args.map(formatValue).join(" "));
    },
    error: (...args: unknown[]) => {
      logs.push(args.map(formatValue).join(" "));
    },
  };

  try {
    const runner = new Function(
      "console",
      `"use strict";\n${code}`
    );
    runner(captureConsole);
  } catch (error) {
    return {
      success: false,
      message: "実行エラー",
      error: error instanceof Error ? error.message : String(error),
      details: logs,
    };
  }

  const output = logs.join("\n");
  const testCase = problem.testCases[0];

  if (!testCase) {
    return {
      success: logs.length > 0,
      message: logs.length > 0 ? "コードが実行されました" : "出力がありません",
      details: logs,
    };
  }

  const expected = formatValue(testCase.expected);
  const passed = output === expected;

  return {
    success: passed,
    message: passed ? "Correct!" : "Incorrect",
    details: passed
      ? [`出力: ${output}`]
      : [`期待値: ${expected}`, `あなたの出力: ${output || "(なし)"}`],
    error: passed ? undefined : "出力が期待値と一致しません",
  };
}

/** 関数をテストケースで検証する */
export function runTestCode(code: string, problem: Problem): RunResult {
  const functionName = problem.functionName;

  if (!functionName) {
    return {
      success: false,
      message: "設定エラー",
      error: "functionName が問題データに設定されていません",
    };
  }

  let userFunction: (...args: unknown[]) => unknown;

  try {
    const factory = new Function(
      `"use strict";\n${code}\nreturn ${functionName};`
    );
    userFunction = factory();

    if (typeof userFunction !== "function") {
      return {
        success: false,
        message: "実行エラー",
        error: `関数 "${functionName}" が見つかりません。関数を定義してください。`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "実行エラー",
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const testResults = problem.testCases.map((testCase) => {
    try {
      const actual = userFunction(...testCase.input);
      const passed = valuesEqual(actual, testCase.expected);

      return {
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        description: testCase.description,
      };
    } catch (error) {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: undefined,
        description: testCase.description,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  const allPassed = testResults.every((r) => r.passed);

  return {
    success: allPassed,
    message: allPassed ? "Correct!" : "Incorrect",
    details: testResults.map((r, i) => {
      const label = r.description ?? `テスト ${i + 1}`;
      if (r.passed) return `✓ ${label}`;
      if (r.error) return `✗ ${label}: ${r.error}`;
      return `✗ ${label}: 期待値 ${formatValue(r.expected)}, 実際 ${formatValue(r.actual)}`;
    }),
    testResults,
  };
}

const strategies: Record<Problem["type"], CodeRunnerStrategy["run"]> = {
  execution: runExecutionCode,
  test: runTestCode,
};

export function runCode(code: string, problem: Problem): RunResult {
  const strategy = strategies[problem.type];
  if (!strategy) {
    return {
      success: false,
      message: "未対応の判定方式",
      error: `type "${problem.type}" はサポートされていません`,
    };
  }
  return strategy(code, problem);
}

export function registerRunnerStrategy(
  type: Problem["type"],
  runner: CodeRunnerStrategy["run"]
): void {
  strategies[type] = runner;
}
