import type { ProblemStatus } from "@/types/admin";
import {
  PROBLEM_STATUS_CLASSES,
  PROBLEM_STATUS_LABELS,
} from "@/types/admin";

export default function ProblemStatusBadge({
  status,
}: {
  status: ProblemStatus;
}) {
  return (
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${PROBLEM_STATUS_CLASSES[status]}`}
    >
      {PROBLEM_STATUS_LABELS[status]}
    </span>
  );
}
