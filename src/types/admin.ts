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

export interface WeekMemberDetail {
  id: string;
  display_name: string;
  role: string;
  solved_count: number;
  total_attempts: number;
  total_successes: number;
  last_activity_at: string | null;
  progress: MemberProblemProgress[];
  attempts: MemberProblemAttempt[];
}

export interface WeekDetail {
  members: WeekMemberDetail[];
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

export type WeekMemberStatus = "cleared" | "in_progress" | "not_started";

export function getWeekMemberStatus(
  solvedCount: number,
  problemCount: number,
  totalAttempts: number
): WeekMemberStatus {
  if (problemCount > 0 && solvedCount >= problemCount) return "cleared";
  if (totalAttempts > 0) return "in_progress";
  return "not_started";
}

export const WEEK_MEMBER_STATUS_LABELS: Record<WeekMemberStatus, string> = {
  cleared: "週クリア",
  in_progress: "挑戦中",
  not_started: "未着手",
};

export const WEEK_MEMBER_STATUS_CLASSES: Record<WeekMemberStatus, string> = {
  cleared: "bg-codewars-success/20 text-codewars-success",
  in_progress: "bg-codewars-warning/20 text-codewars-warning",
  not_started: "bg-codewars-border text-codewars-muted",
};

export function countWeekClearedMembers(
  members: WeekMemberDetail[],
  problemCount: number
): number {
  return members.filter(
    (member) =>
      getWeekMemberStatus(
        member.solved_count,
        problemCount,
        member.total_attempts
      ) === "cleared"
  ).length;
}
