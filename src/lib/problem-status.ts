import type { ProblemProgress } from "@/lib/progress";
import type { ProblemStatus } from "@/types/admin";

export function getLocalProblemStatus(
  progress: ProblemProgress | null | undefined,
  starterCode: string
): ProblemStatus {
  if (progress?.isSolved) return "solved";
  if (!progress) return "not_started";

  const hasEditedCode =
    progress.code !== undefined && progress.code !== starterCode;
  const hasUsedHints = (progress.hintsRevealed ?? 0) > 0;
  const hasAttempted = progress.hasAttempted === true;

  if (hasEditedCode || hasUsedHints || hasAttempted) {
    return "in_progress";
  }

  return "not_started";
}
