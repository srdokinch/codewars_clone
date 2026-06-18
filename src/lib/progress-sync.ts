import { createClient } from "@/lib/supabase/client";
import type { RunResult, TestCaseResult } from "@/types";

export interface StoredTestResult {
  index: number;
  passed: boolean;
  description?: string;
  error?: string;
}

export interface RecordAttemptOptions {
  testResults?: StoredTestResult[];
  hintsRevealed: number;
}

function normalizeTestResults(result: RunResult): StoredTestResult[] {
  if (result.testResults && result.testResults.length > 0) {
    return result.testResults.map((test: TestCaseResult, index: number) => ({
      index,
      passed: test.passed,
      description: test.description ?? `テスト ${index + 1}`,
      error: test.error ?? (test.passed ? undefined : `期待値 ${String(test.expected)}, 実際 ${String(test.actual)}`),
    }));
  }

  return [
    {
      index: 0,
      passed: result.success,
      description: "出力検証",
      error: result.success ? undefined : result.error,
    },
  ];
}

export function buildStoredTestResults(result: RunResult): StoredTestResult[] {
  return normalizeTestResults(result);
}

export async function recordProblemAttempt(
  problemId: string,
  success: boolean,
  options: RecordAttemptOptions
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.rpc("record_problem_attempt", {
    p_problem_id: problemId,
    p_success: success,
    p_test_results: options.testResults ?? null,
    p_hints_revealed: options.hintsRevealed,
  });

  if (error) {
    console.error("Failed to record progress:", error.message);
  }
}

export async function recordHintUsage(
  problemId: string,
  hintsRevealed: number
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.rpc("record_hint_usage", {
    p_problem_id: problemId,
    p_hints_revealed: hintsRevealed,
  });

  if (error) {
    console.error("Failed to record hint usage:", error.message);
  }
}

export async function recordRunResult(
  problemId: string,
  result: RunResult,
  hintsRevealed: number
): Promise<void> {
  await recordProblemAttempt(problemId, result.success, {
    testResults: buildStoredTestResults(result),
    hintsRevealed,
  });
}
