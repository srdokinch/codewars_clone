import { getAllProblems } from "@/lib/problems";
import { getAllProgress, type ProblemProgress } from "@/lib/progress";
import { createClient } from "@/lib/supabase/client";

const SYNCED_MEMBERS_KEY = "dojo:progress-synced-members";

type ProgressStore = Record<string, ProblemProgress>;

export interface MigratableItem {
  problemId: string;
  isSolved: boolean;
  hintsRevealed: number;
  hadAttempt: boolean;
}

export interface MigrateResult {
  skipped: boolean;
  migratedCount: number;
  hintOnlyCount: number;
  failedCount: number;
}

function readSyncedMembers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SYNCED_MEMBERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function isAlreadyMigrated(memberId: string): boolean {
  return readSyncedMembers().includes(memberId);
}

function markMigrated(memberId: string): void {
  if (typeof window === "undefined") return;
  try {
    const members = readSyncedMembers();
    if (members.includes(memberId)) return;
    localStorage.setItem(
      SYNCED_MEMBERS_KEY,
      JSON.stringify([...members, memberId])
    );
  } catch {
    // localStorage が利用できない場合は無視
  }
}

export function collectMigratableItems(store: ProgressStore): MigratableItem[] {
  const validIds = new Set(getAllProblems().map((problem) => problem.id));
  const items: MigratableItem[] = [];

  for (const [problemId, progress] of Object.entries(store)) {
    if (!validIds.has(problemId)) continue;

    const hintsRevealed = progress.hintsRevealed ?? 0;
    const isSolved = progress.isSolved === true;
    const hadAttempt = isSolved || progress.hasAttempted === true;

    if (hadAttempt || hintsRevealed > 0) {
      items.push({ problemId, isSolved, hintsRevealed, hadAttempt });
    }
  }

  return items;
}

async function migrateItem(item: MigratableItem): Promise<boolean> {
  const supabase = createClient();

  if (item.hadAttempt) {
    const { error } = await supabase.rpc("record_problem_attempt", {
      p_problem_id: item.problemId,
      p_success: item.isSolved,
      p_test_results: null,
      p_hints_revealed: item.hintsRevealed,
    });

    if (error) {
      console.error(
        `Failed to migrate attempt for ${item.problemId}:`,
        error.message
      );
      return false;
    }

    return true;
  }

  const { error } = await supabase.rpc("record_hint_usage", {
    p_problem_id: item.problemId,
    p_hints_revealed: item.hintsRevealed,
  });

  if (error) {
    console.error(
      `Failed to migrate hints for ${item.problemId}:`,
      error.message
    );
    return false;
  }

  return true;
}

export async function fetchCurrentMemberId(): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("current_member_id");

  if (error) {
    console.error("Failed to fetch member id:", error.message);
    return null;
  }

  return typeof data === "string" ? data : null;
}

export async function migrateLocalProgressToCloud(
  memberId: string
): Promise<MigrateResult> {
  if (isAlreadyMigrated(memberId)) {
    return {
      skipped: true,
      migratedCount: 0,
      hintOnlyCount: 0,
      failedCount: 0,
    };
  }

  const items = collectMigratableItems(getAllProgress());

  if (items.length === 0) {
    markMigrated(memberId);
    return {
      skipped: false,
      migratedCount: 0,
      hintOnlyCount: 0,
      failedCount: 0,
    };
  }

  let migratedCount = 0;
  let hintOnlyCount = 0;
  let failedCount = 0;

  for (const item of items) {
    const ok = await migrateItem(item);
    if (!ok) {
      failedCount++;
      continue;
    }

    if (item.hadAttempt) {
      migratedCount++;
    } else {
      hintOnlyCount++;
    }
  }

  if (failedCount === 0) {
    markMigrated(memberId);
  }

  return {
    skipped: false,
    migratedCount,
    hintOnlyCount,
    failedCount,
  };
}
