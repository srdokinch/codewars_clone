"use client";

import type { WeekDetail } from "@/types/admin";
import { countWeekClearedMembers } from "@/types/admin";
import WeekDetailPanel from "./WeekDetailPanel";

interface WeekCardProps {
  weekId: number;
  weekTitle: string;
  problemCount: number;
  isExpanded: boolean;
  isLoading: boolean;
  hasError: boolean;
  detail: WeekDetail | undefined;
  onToggle: () => void;
}

export default function WeekCard({
  weekId,
  weekTitle,
  problemCount,
  isExpanded,
  isLoading,
  hasError,
  detail,
  onToggle,
}: WeekCardProps) {
  const clearedCount =
    detail && problemCount > 0
      ? countWeekClearedMembers(detail.members, problemCount)
      : null;

  return (
    <div className="overflow-hidden rounded-lg border border-codewars-border bg-codewars-surface [html.light_&]:bg-white [html.light_&]:shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left text-codewars-text transition-colors hover:bg-codewars-panel/30 [html.light_&]:hover:bg-codewars-panel/60"
        aria-expanded={isExpanded}
        aria-label={`Week ${weekId} の詳細を${isExpanded ? "閉じる" : "開く"}`}
      >
        <span className="shrink-0 text-codewars-muted">
          {isExpanded ? "▼" : "▶"}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-codewars-panel font-mono text-sm font-semibold text-codewars-accent [html.light_&]:ring-1 [html.light_&]:ring-codewars-border">
          {weekId}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-codewars-text">{weekTitle}</p>
          <p className="mt-0.5 text-xs text-codewars-muted">
            {problemCount}問
            {clearedCount !== null && clearedCount > 0 && (
              <span className="ml-2 font-medium text-codewars-success">
                · {clearedCount}名が週クリア
              </span>
            )}
          </p>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-codewars-border bg-codewars-bg/20 px-4 pb-4 [html.light_&]:bg-codewars-panel/25">
          {isLoading && (
            <p className="py-4 text-sm text-codewars-muted">読み込み中...</p>
          )}
          {hasError && (
            <p className="py-4 text-sm text-codewars-accent">
              詳細の読み込みに失敗しました。
            </p>
          )}
          {detail && !isLoading && !hasError && (
            <WeekDetailPanel weekId={weekId} detail={detail} />
          )}
        </div>
      )}
    </div>
  );
}
