"use client";

import { useState } from "react";
import { getAllProblems, getWeeks } from "@/lib/problems";
import type { StoredTestResult } from "@/lib/progress-sync";
import type { MemberDetail } from "@/types/admin";
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
  attempts: MemberDetail["attempts"];
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
      {expanded && <ProblemAttemptHistory attempts={attempts} />}
    </div>
  );
}

interface MemberDetailPanelProps {
  detail: MemberDetail;
}

export default function MemberDetailPanel({ detail }: MemberDetailPanelProps) {
  const allProblems = getAllProblems();
  const weeks = getWeeks();
  const progressByProblemId = new Map(
    detail.progress.map((item) => [item.problem_id, item])
  );
  const attemptsByProblemId = new Map<string, MemberDetail["attempts"]>();

  for (const attempt of detail.attempts) {
    const existing = attemptsByProblemId.get(attempt.problem_id) ?? [];
    existing.push(attempt);
    attemptsByProblemId.set(attempt.problem_id, existing);
  }

  const problemsByWeek = weeks
    .map((week) => ({
      week,
      problems: allProblems.filter((problem) => problem.week === week.id),
    }))
    .filter((group) => group.problems.length > 0);

  return (
    <div className="border-t border-codewars-border bg-codewars-bg/20">
      <div className="hidden items-center gap-3 border-b border-codewars-border/50 px-4 py-2 text-xs font-medium text-codewars-muted md:flex">
        <span className="w-4 shrink-0" />
        <span className="min-w-[5rem] shrink-0">状態</span>
        <span className="min-w-0 flex-1">問題名</span>
        <span className="hidden shrink-0 sm:inline">ID</span>
        <span className="w-28 shrink-0">試行 (OK/NG)</span>
        <span className="w-20 shrink-0">ヒント</span>
        <span className="hidden w-40 shrink-0 lg:inline">最新結果</span>
      </div>
      {problemsByWeek.map(({ week, problems }) => (
        <section key={week.id} className="border-b border-codewars-border/50">
          <h3 className="bg-codewars-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
            Week {week.id}: {week.title}
          </h3>
          <div>
            {problems.map((problem) => {
              const progress = progressByProblemId.get(problem.id);
              const status = getProblemStatus(progress);
              const attemptCount = progress?.attempt_count ?? 0;
              const successCount = progress?.success_count ?? 0;

              return (
                <ProblemRow
                  key={problem.id}
                  problemId={problem.id}
                  title={problem.title}
                  hintsTotal={problem.hints.length}
                  status={status}
                  attemptCount={attemptCount}
                  successCount={successCount}
                  hintsRevealed={progress?.hints_revealed ?? 0}
                  latestTestResults={progress?.latest_test_results ?? null}
                  attempts={attemptsByProblemId.get(problem.id) ?? []}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
