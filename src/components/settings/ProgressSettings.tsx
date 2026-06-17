"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAllProblems } from "@/lib/problems";
import {
  clearAllProgress,
  getAllProgress,
  PROGRESS_CLEARED_EVENT,
  PROGRESS_UPDATED_EVENT,
} from "@/lib/progress";
import type { ProblemProgress } from "@/lib/progress";

interface ProgressItem {
  id: string;
  title: string;
  week: number;
}

interface ProgressSummary {
  inProgressItems: ProgressItem[];
  solvedItems: ProgressItem[];
}

function hasInProgressCode(
  progress: ProblemProgress,
  starterCode: string
): boolean {
  return (
    !progress.isSolved &&
    progress.code !== undefined &&
    progress.code !== starterCode
  );
}

function buildSummary(): ProgressSummary {
  const store = getAllProgress();
  const problemsById = new Map(
    getAllProblems().map((problem) => [problem.id, problem])
  );

  const inProgressItems: ProgressItem[] = [];
  const solvedItems: ProgressItem[] = [];

  for (const [id, progress] of Object.entries(store)) {
    const problem = problemsById.get(id);
    if (!problem) continue;

    const item: ProgressItem = {
      id,
      title: problem.title,
      week: problem.week,
    };

    if (progress.isSolved) {
      solvedItems.push(item);
    } else if (hasInProgressCode(progress, problem.starterCode)) {
      inProgressItems.push(item);
    }
  }

  const sortByWeek = (a: ProgressItem, b: ProgressItem) =>
    a.week - b.week || a.id.localeCompare(b.id);

  inProgressItems.sort(sortByWeek);
  solvedItems.sort(sortByWeek);

  return { inProgressItems, solvedItems };
}

function ProgressListSection({
  title,
  items,
  emptyMessage,
  statusLabel,
  statusClassName,
}: {
  title: string;
  items: ProgressItem[];
  emptyMessage: string;
  statusLabel: string;
  statusClassName: string;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-codewars-text">{title}</h3>
      {items.length > 0 ? (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/week/${item.week}/${item.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-codewars-border bg-codewars-bg/50 px-4 py-3 text-sm transition-colors hover:border-codewars-accent/50 hover:bg-codewars-panel/30"
              >
                <span className="truncate text-codewars-text">
                  Week {item.week}: {item.title}
                </span>
                <span className={`shrink-0 text-xs ${statusClassName}`}>
                  {statusLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-codewars-border px-4 py-3 text-sm text-codewars-muted">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export default function ProgressSettings() {
  const [summary, setSummary] = useState<ProgressSummary>({
    inProgressItems: [],
    solvedItems: [],
  });
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSummary(buildSummary());
  }, []);

  useEffect(() => {
    refresh();

    const handleRefresh = () => refresh();
    window.addEventListener(PROGRESS_CLEARED_EVENT, handleRefresh);
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener(PROGRESS_CLEARED_EVENT, handleRefresh);
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [refresh]);

  const totalCount =
    summary.inProgressItems.length + summary.solvedItems.length;

  const handleClear = () => {
    if (totalCount === 0) return;

    const confirmed = window.confirm(
      "保存されているコードと正解状況をすべて削除します。この操作は取り消せません。"
    );
    if (!confirmed) return;

    clearAllProgress();
    setMessage("保存データを削除しました。");
    refresh();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-codewars-border bg-codewars-surface p-6">
        <h2 className="text-lg font-semibold">学習データ</h2>
        <p className="mt-2 text-sm text-codewars-muted">
          このブラウザに保存されているコードと正解状況を管理します。
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-codewars-border bg-codewars-bg/50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-codewars-muted">
              途中保存中のコード数
            </dt>
            <dd className="mt-1 text-2xl font-bold text-codewars-text">
              {summary.inProgressItems.length}
            </dd>
          </div>
          <div className="rounded-md border border-codewars-border bg-codewars-bg/50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-codewars-muted">
              正解済み
            </dt>
            <dd className="mt-1 text-2xl font-bold text-codewars-success">
              {summary.solvedItems.length}
            </dd>
          </div>
        </dl>

        <ProgressListSection
          title="途中保存中のコード"
          items={summary.inProgressItems}
          emptyMessage="途中保存中のコードはありません"
          statusLabel="途中"
          statusClassName="text-codewars-muted"
        />

        <ProgressListSection
          title="正解済みの問題"
          items={summary.solvedItems}
          emptyMessage="正解済みの問題はありません"
          statusLabel="正解済み"
          statusClassName="text-codewars-success"
        />

        {message && (
          <p className="mt-4 text-sm text-codewars-success">{message}</p>
        )}

        <button
          type="button"
          onClick={handleClear}
          disabled={totalCount === 0}
          className="mt-6 rounded-md border border-codewars-accent/50 bg-codewars-accent/10 px-4 py-2 text-sm font-semibold text-codewars-accent transition-colors hover:bg-codewars-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          保存データをすべて削除
        </button>
      </section>
    </div>
  );
}
