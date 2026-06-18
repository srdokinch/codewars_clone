"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LevelBadge from "@/components/ui/LevelBadge";
import ProblemStatusBadge from "@/components/ui/ProblemStatusBadge";
import { getLocalProblemStatus } from "@/lib/problem-status";
import {
  getAllProgress,
  PROGRESS_CLEARED_EVENT,
  PROGRESS_UPDATED_EVENT,
  type ProblemProgress,
} from "@/lib/progress";
import type { Problem } from "@/types";

type ProgressStore = Record<string, ProblemProgress>;

interface WeekProblemListProps {
  problems: Problem[];
  weekNum: number;
  numbered?: boolean;
  variant?: "basic" | "advanced";
}

export default function WeekProblemList({
  problems,
  weekNum,
  numbered = false,
  variant = "basic",
}: WeekProblemListProps) {
  const [progressStore, setProgressStore] = useState<ProgressStore>({});

  const refresh = useCallback(() => {
    setProgressStore(getAllProgress());
  }, []);

  useEffect(() => {
    refresh();

    window.addEventListener(PROGRESS_UPDATED_EVENT, refresh);
    window.addEventListener(PROGRESS_CLEARED_EVENT, refresh);
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refresh);
      window.removeEventListener(PROGRESS_CLEARED_EVENT, refresh);
    };
  }, [refresh]);
  const isAdvanced = variant === "advanced";

  return (
    <div className="space-y-2">
      {problems.map((problem, i) => {
        const progress = progressStore[problem.id];
        const status = getLocalProblemStatus(progress, problem.starterCode);

        return (
          <Link
            key={problem.id}
            id={problem.id}
            href={`/week/${weekNum}/${problem.id}`}
            className={`flex items-center gap-4 rounded-md border px-5 py-4 transition-colors ${
              isAdvanced
                ? "border-codewars-accent/20 bg-codewars-surface hover:border-codewars-accent/50 hover:bg-codewars-accent/5"
                : "border-codewars-border bg-codewars-surface hover:border-codewars-accent/50 hover:bg-codewars-panel/30"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-codewars-panel font-mono text-sm ${
                isAdvanced ? "text-codewars-accent" : "text-codewars-muted"
              }`}
            >
              {numbered ? i + 1 : "★"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{problem.title}</p>
            </div>
            <ProblemStatusBadge status={status} />
            <LevelBadge level={problem.level} />
          </Link>
        );
      })}
    </div>
  );
}
