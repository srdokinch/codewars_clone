"use client";

import { useState } from "react";
import type { Problem } from "@/types";
import type { StoredTestResult } from "@/lib/progress-sync";
import type { MemberProblemAttempt, MemberProblemProgress } from "@/types/admin";
import {
  getProblemStatus,
  PROBLEM_STATUS_CLASSES,
  PROBLEM_STATUS_LABELS,
} from "@/types/admin";
import ProblemAttemptHistory from "./ProblemAttemptHistory";

function formatLatestResults(results: StoredTestResult[] | null): string {
  if (!results || results.length === 0) return "—";

  return results
    .map((result) => {
      const label = result.description ?? `T${result.index + 1}`;
      return result.passed ? `✓${label}` : `✗${label}`;
    })
    .join(" ");
}

interface ProblemRowProps {
  problemId: string;
  title: string;
  hintsTotal: number;
  status: "not_started" | "in_progress" | "solved";
  attemptCount: number;
  successCount: number;
  hintsRevealed: number;
  latestTestResults: StoredTestResult[] | null;
  memo: string;
  memoUpdatedAt: string | null;
  attempts: MemberProblemAttempt[];
}

function formatMemoUpdatedAt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProblemRow({
  problemId,
  title,
  hintsTotal,
  status,
  attemptCount,
  successCount,
  hintsRevealed,
  latestTestResults,
  memo,
  memoUpdatedAt,
  attempts,
}: ProblemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const failureCount = attemptCount - successCount;

  return (
    <div className="border-b border-codewars-border/30 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-codewars-surface/50"
      >
        <span className="w-4 shrink-0 text-codewars-muted">
          {expanded ? "▼" : "▶"}
        </span>
        <span className="min-w-[5rem] shrink-0">
          <span
            className={`rounded px-2 py-0.5 text-xs ${PROBLEM_STATUS_CLASSES[status]}`}
          >
            {PROBLEM_STATUS_LABELS[status]}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
        <span className="hidden shrink-0 font-mono text-xs text-codewars-muted sm:inline">
          {problemId}
        </span>
        <span className="w-28 shrink-0 font-mono text-xs text-codewars-muted">
          {attemptCount > 0
            ? `${attemptCount}回 (${successCount}/${failureCount})`
            : "—"}
        </span>
        <span className="w-20 shrink-0 font-mono text-xs text-codewars-muted">
          {hintsRevealed}/{hintsTotal}
        </span>
        <span className="hidden w-40 shrink-0 truncate font-mono text-xs text-codewars-muted lg:inline">
          {formatLatestResults(latestTestResults)}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-codewars-border/30 bg-codewars-bg/20">
          <div className="border-b border-codewars-border/30 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-codewars-accent">
                メモ
              </h4>
              {memoUpdatedAt && (
                <span className="text-xs text-codewars-muted">
                  更新: {formatMemoUpdatedAt(memoUpdatedAt)}
                </span>
              )}
            </div>
            {memo.trim() ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-codewars-text">
                {memo}
              </p>
            ) : (
              <p className="text-sm italic text-codewars-disabled">（メモなし）</p>
            )}
          </div>
          <ProblemAttemptHistory attempts={attempts} />
        </div>
      )}
    </div>
  );
}

interface ProblemProgressListProps {
  problems: Problem[];
  progress: MemberProblemProgress[];
  attempts: MemberProblemAttempt[];
  embedded?: boolean;
}

export default function ProblemProgressList({
  problems,
  progress,
  attempts,
  embedded = false,
}: ProblemProgressListProps) {
  const progressByProblemId = new Map(
    progress.map((item) => [item.problem_id, item])
  );
  const attemptsByProblemId = new Map<string, MemberProblemAttempt[]>();

  for (const attempt of attempts) {
    const existing = attemptsByProblemId.get(attempt.problem_id) ?? [];
    existing.push(attempt);
    attemptsByProblemId.set(attempt.problem_id, existing);
  }

  return (
    <div className={embedded ? "rounded-md" : undefined}>
      <div className="hidden items-center gap-3 border-b border-codewars-border/50 px-4 py-2 text-xs font-medium text-codewars-muted md:flex">
        <span className="w-4 shrink-0" />
        <span className="min-w-[5rem] shrink-0">状態</span>
        <span className="min-w-0 flex-1">問題名</span>
        <span className="hidden shrink-0 sm:inline">ID</span>
        <span className="w-28 shrink-0">試行 (OK/NG)</span>
        <span className="w-20 shrink-0">ヒント</span>
        <span className="hidden w-40 shrink-0 lg:inline">最新結果</span>
      </div>
      {problems.map((problem) => {
        const problemProgress = progressByProblemId.get(problem.id);
        const status = getProblemStatus(problemProgress);
        const attemptCount = problemProgress?.attempt_count ?? 0;
        const successCount = problemProgress?.success_count ?? 0;

        return (
          <ProblemRow
            key={problem.id}
            problemId={problem.id}
            title={problem.title}
            hintsTotal={problem.hints.length}
            status={status}
            attemptCount={attemptCount}
            successCount={successCount}
            hintsRevealed={problemProgress?.hints_revealed ?? 0}
            latestTestResults={problemProgress?.latest_test_results ?? null}
            memo={problemProgress?.memo ?? ""}
            memoUpdatedAt={problemProgress?.memo_updated_at ?? null}
            attempts={attemptsByProblemId.get(problem.id) ?? []}
          />
        );
      })}
    </div>
  );
}
