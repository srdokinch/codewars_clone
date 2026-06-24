"use client";

import { useState } from "react";
import { getProblemsByWeek } from "@/lib/problems";
import type { WeekMemberDetail } from "@/types/admin";
import {
  getWeekMemberStatus,
  WEEK_MEMBER_STATUS_CLASSES,
  WEEK_MEMBER_STATUS_LABELS,
} from "@/types/admin";
import ProblemProgressList from "./ProblemProgressList";

interface WeekMemberCardProps {
  member: WeekMemberDetail;
  weekId: number;
  problemCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function WeekMemberCard({
  member,
  weekId,
  problemCount,
  isExpanded,
  onToggle,
}: WeekMemberCardProps) {
  const problems = getProblemsByWeek(weekId);
  const accuracy =
    member.total_attempts > 0
      ? Math.round((member.total_successes / member.total_attempts) * 100)
      : null;
  const weekStatus = getWeekMemberStatus(
    member.solved_count,
    problemCount,
    member.total_attempts
  );
  const isCleared = weekStatus === "cleared";

  return (
    <div
      className={`overflow-hidden rounded-md border border-codewars-border/60 bg-codewars-bg/20 border-l-2 [html.light_&]:border-codewars-border [html.light_&]:bg-white [html.light_&]:shadow-sm ${
        isCleared
          ? "border-l-codewars-success/60 [html.light_&]:border-l-codewars-success"
          : "border-l-codewars-accent/40 [html.light_&]:border-l-codewars-accent"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 p-4 text-left text-codewars-text transition-colors hover:bg-codewars-surface/30 [html.light_&]:hover:bg-codewars-panel/50 sm:flex-row sm:items-center sm:justify-between"
        aria-expanded={isExpanded}
        aria-label={`${member.display_name} の詳細を${isExpanded ? "閉じる" : "開く"}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 text-codewars-muted">
            {isExpanded ? "▼" : "▶"}
          </span>
          <span className="truncate font-medium text-codewars-text">
            {member.display_name}
          </span>
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${WEEK_MEMBER_STATUS_CLASSES[weekStatus]} ${weekStatus === "not_started" ? "[html.light_&]:bg-codewars-panel [html.light_&]:text-codewars-text" : ""} ${weekStatus === "in_progress" ? "[html.light_&]:bg-codewars-warning/15" : ""} ${weekStatus === "cleared" ? "[html.light_&]:bg-codewars-success/15" : ""}`}
          >
            {WEEK_MEMBER_STATUS_LABELS[weekStatus]}
          </span>
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-xs ${
              member.role === "admin"
                ? "bg-codewars-accent/20 text-codewars-accent [html.light_&]:bg-codewars-accent/10"
                : "bg-codewars-border text-codewars-muted [html.light_&]:bg-codewars-panel [html.light_&]:text-codewars-text"
            }`}
          >
            {member.role === "admin" ? "管理者" : "メンバー"}
          </span>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4 sm:text-sm">
          <Stat label="クリア数">
            {member.solved_count} / {problemCount}
          </Stat>
          <Stat label="正誤率">
            {accuracy !== null ? `${accuracy}%` : "—"}
          </Stat>
          <Stat label="試行回数">{member.total_attempts}</Stat>
          <Stat label="最終活動">
            {member.last_activity_at
              ? new Date(member.last_activity_at).toLocaleString("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </Stat>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-codewars-border/50 bg-codewars-bg/30 [html.light_&]:border-codewars-border [html.light_&]:bg-codewars-panel/30">
          <ProblemProgressList
            problems={problems}
            progress={member.progress}
            attempts={member.attempts}
            embedded
          />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-codewars-muted">{label}</span>
      <p className="font-mono text-codewars-text">{children}</p>
    </div>
  );
}
