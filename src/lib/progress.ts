const STORAGE_KEY = "dojo:progress";

export interface ProblemProgress {
  code?: string;
  isSolved?: boolean;
  hintsRevealed?: number;
  hasAttempted?: boolean;
  memo?: string;
}

type ProgressStore = Record<string, ProblemProgress>;

function readStore(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage が利用できない場合は無視
  }
}

export function getProblemProgress(problemId: string): ProblemProgress | null {
  const store = readStore();
  return store[problemId] ?? null;
}

export const PROGRESS_UPDATED_EVENT = "dojo:progress-updated";
export const PROGRESS_CLEARED_EVENT = "dojo:progress-cleared";

export function saveProblemProgress(
  problemId: string,
  update: Partial<ProblemProgress>
): void {
  const store = readStore();
  store[problemId] = { ...store[problemId], ...update };
  writeStore(store);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
  }
}

export function getAllProgress(): ProgressStore {
  return readStore();
}

export interface CloudProgressRow {
  problem_id: string;
  is_solved: boolean;
  hints_revealed: number;
  attempt_count: number;
}

export function mergeCloudProgressIntoLocal(
  rows: CloudProgressRow[]
): { updatedCount: number } {
  const store = readStore();
  let updatedCount = 0;

  for (const row of rows) {
    const existing = store[row.problem_id] ?? {};
    const merged: ProblemProgress = {
      ...existing,
      isSolved: existing.isSolved === true || row.is_solved,
      hintsRevealed: Math.max(
        existing.hintsRevealed ?? 0,
        row.hints_revealed ?? 0
      ),
      hasAttempted:
        existing.hasAttempted === true ||
        row.attempt_count > 0 ||
        row.is_solved,
    };

    const changed =
      merged.isSolved !== existing.isSolved ||
      merged.hintsRevealed !== (existing.hintsRevealed ?? 0) ||
      merged.hasAttempted !== (existing.hasAttempted ?? false);

    if (changed) {
      store[row.problem_id] = merged;
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    writeStore(store);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
    }
  }

  return { updatedCount };
}

export function clearAllProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(PROGRESS_CLEARED_EVENT));
  } catch {
    // localStorage が利用できない場合は無視
  }
}
