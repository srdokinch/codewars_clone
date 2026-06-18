import type { StoredTestResult } from "@/lib/progress-sync";

export interface DashboardMember {
  id: string;
  display_name: string;
  role: string;
  created_at: string;
  total_attempts: number;
  total_successes: number;
  solved_count: number;
  last_activity_at: string | null;
}

export interface MemberProblemProgress {
  problem_id: string;
  is_solved: boolean;
  attempt_count: number;
  success_count: number;
  hints_revealed: number;
  last_attempted_at: string | null;
  latest_test_results: StoredTestResult[] | null;
}

export interface MemberProblemAttempt {
  id: string;
  problem_id: string;
  success: boolean;
  attempted_at: string;
  hints_revealed: number;
  test_results: StoredTestResult[] | null;
}

export interface MemberDetail {
  member: {
    id: string;
    display_name: string;
    role: string;
    created_at: string;
  } | null;
  progress: MemberProblemProgress[];
  attempts: MemberProblemAttempt[];
}

export type ProblemStatus = "not_started" | "in_progress" | "solved";

export function getProblemStatus(
  progress: MemberProblemProgress | undefined
): ProblemStatus {
  if (!progress || progress.attempt_count === 0) {
    if (progress?.is_solved) return "solved";
    return "not_started";
  }
  if (progress.is_solved) return "solved";
  return "in_progress";
}

export const PROBLEM_STATUS_LABELS: Record<ProblemStatus, string> = {
  not_started: "未着手",
  in_progress: "挑戦中",
  solved: "クリア",
};

export const PROBLEM_STATUS_CLASSES: Record<ProblemStatus, string> = {
  not_started: "bg-codewars-border text-codewars-muted",
  in_progress: "bg-codewars-warning/20 text-codewars-warning",
  solved: "bg-codewars-success/20 text-codewars-success",
};
