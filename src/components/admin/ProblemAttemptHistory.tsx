import type { StoredTestResult } from "@/lib/progress-sync";

interface ProblemAttemptHistoryProps {
  attempts: {
    id: string;
    success: boolean;
    attempted_at: string;
    hints_revealed: number;
    test_results: StoredTestResult[] | null;
  }[];
}

function formatTestResults(results: StoredTestResult[] | null): string[] {
  if (!results || results.length === 0) return [];

  return results.map((result) => {
    const label = result.description ?? `テスト ${result.index + 1}`;
    if (result.passed) return `✓ ${label}`;
    if (result.error) return `✗ ${label}: ${result.error}`;
    return `✗ ${label}`;
  });
}

export default function ProblemAttemptHistory({
  attempts,
}: ProblemAttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <p className="px-4 py-2 text-xs text-codewars-muted">試行履歴はありません。</p>
    );
  }

  return (
    <div className="space-y-2 border-t border-codewars-border/50 bg-codewars-bg/30 px-4 py-3">
      {attempts.map((attempt) => {
        const testLines = formatTestResults(attempt.test_results);

        return (
          <div
            key={attempt.id}
            className="rounded-md border border-codewars-border/50 bg-codewars-surface/50 px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-codewars-muted">
                {new Date(attempt.attempted_at).toLocaleString("ja-JP")}
              </span>
              <span
                className={`font-semibold ${
                  attempt.success
                    ? "text-codewars-success"
                    : "text-codewars-accent"
                }`}
              >
                {attempt.success ? "OK" : "NG"}
              </span>
              <span className="text-codewars-muted">
                ヒント {attempt.hints_revealed} 件使用
              </span>
            </div>
            {testLines.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {testLines.map((line, index) => (
                  <li
                    key={index}
                    className={`font-mono text-xs ${
                      line.startsWith("✓")
                        ? "text-codewars-success"
                        : "text-codewars-accent"
                    }`}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
