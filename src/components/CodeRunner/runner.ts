import type { Problem, RunResult, VariableCheck } from "@/types";

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

/** 行ごとに空白を除いて比較する（改行の区切りは維持） */
function normalizeOutputLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/\s/g, ""))
    .filter((line) => line.length > 0);
}

function outputsMatch(actual: string, expected: string): boolean {
  const actualLines = normalizeOutputLines(actual);
  const expectedLines = normalizeOutputLines(expected);

  if (actualLines.length !== expectedLines.length) return false;

  return actualLines.every((line, index) => line === expectedLines[index]);
}

const VARIABLE_TYPE_LABELS: Record<VariableCheck["type"], string> = {
  number: "数値",
  string: "文字列",
  boolean: "真偽値",
};

function getVariableTypes(
  code: string,
  names: string[],
  captureConsole: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  }
): Record<string, string> {
  const checks = names
    .map(
      (name) =>
        `try { __types[${JSON.stringify(name)}] = typeof ${name}; } catch { __types[${JSON.stringify(name)}] = "undefined"; }`
    )
    .join("\n");

  const runner = new Function(
    "console",
    `"use strict";\n${code}\nconst __types = {};\n${checks}\nreturn __types;`
  );

  return runner(captureConsole) as Record<string, string>;
}

function checkVariableTypes(
  code: string,
  checks: VariableCheck[],
  captureConsole: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  }
): { passed: boolean; error?: string; details?: string[] } {
  const names = checks.map((check) => check.name);
  const types = getVariableTypes(code, names, captureConsole);

  for (const check of checks) {
    const actualType = types[check.name];
    const expectedLabel = VARIABLE_TYPE_LABELS[check.type];

    if (actualType === "undefined") {
      return {
        passed: false,
        error: `変数 "${check.name}" が見つかりません`,
        details: [`変数 ${check.name} を宣言してください`],
      };
    }

    if (actualType !== check.type) {
      return {
        passed: false,
        error: `変数 "${check.name}" の型が正しくありません`,
        details: [
          `期待: ${expectedLabel}型`,
          `実際: ${VARIABLE_TYPE_LABELS[actualType as VariableCheck["type"]] ?? actualType}型`,
          check.type === "number"
            ? "数値はクォートで囲まずに代入してください（例: const year = 2024）"
            : undefined,
        ].filter((detail): detail is string => Boolean(detail)),
      };
    }
  }

  return { passed: true };
}

/** === や !== 以外の == を検出する */
function usesLooseEquality(code: string): boolean {
  return /(?<![!=])==(?!=)/.test(code);
}

function checkCodeRules(
  code: string,
  problem: Problem
): { passed: boolean; error?: string; details?: string[] } {
  if (problem.forbidLooseEquality && usesLooseEquality(code)) {
    return {
      passed: false,
      error: "緩い等価比較（==）は使えません",
      details: ["条件式では === を使ってください"],
    };
  }

  return { passed: true };
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
  const passed = outputsMatch(output, expected);

  if (!passed) {
    return {
      success: false,
      message: "Incorrect",
      details: [`期待値: ${expected}`, `あなたの出力: ${output || "(なし)"}`],
      error: "出力の内容が一致しません",
    };
  }

  if (problem.variableChecks?.length) {
    const typeCheck = checkVariableTypes(code, problem.variableChecks, captureConsole);
    if (!typeCheck.passed) {
      return {
        success: false,
        message: "Incorrect",
        error: typeCheck.error,
        details: typeCheck.details,
      };
    }
  }

  const codeRuleCheck = checkCodeRules(code, problem);
  if (!codeRuleCheck.passed) {
    return {
      success: false,
      message: "Incorrect",
      error: codeRuleCheck.error,
      details: codeRuleCheck.details,
    };
  }

  return {
    success: true,
    message: "Correct!",
    details: [`出力: ${output}`],
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
