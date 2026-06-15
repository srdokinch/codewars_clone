import type { ProblemLevel } from "@/types";

const levelStyles: Record<ProblemLevel, string> = {
  basic: "bg-codewars-panel text-blue-300",
  advanced: "bg-codewars-accent/20 text-codewars-accent",
};

const levelLabels: Record<ProblemLevel, string> = {
  basic: "基本",
  advanced: "応用",
};

export default function LevelBadge({ level }: { level: ProblemLevel }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold ${levelStyles[level]}`}
    >
      {levelLabels[level]}
    </span>
  );
}
