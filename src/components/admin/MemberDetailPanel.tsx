"use client";

import { getAllProblems, getWeeks } from "@/lib/problems";
import type { MemberDetail } from "@/types/admin";
import ProblemProgressList from "./ProblemProgressList";

interface MemberDetailPanelProps {
  detail: MemberDetail;
}

export default function MemberDetailPanel({ detail }: MemberDetailPanelProps) {
  const allProblems = getAllProblems();
  const weeks = getWeeks();

  const problemsByWeek = weeks
    .map((week) => ({
      week,
      problems: allProblems.filter((problem) => problem.week === week.id),
    }))
    .filter((group) => group.problems.length > 0);

  return (
    <div className="border-t border-codewars-border bg-codewars-bg/20">
      {problemsByWeek.map(({ week, problems }) => (
        <section key={week.id} className="border-b border-codewars-border/50">
          <h3 className="bg-codewars-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
            Week {week.id}: {week.title}
          </h3>
          <ProblemProgressList
            problems={problems}
            progress={detail.progress}
            attempts={detail.attempts}
          />
        </section>
      ))}
    </div>
  );
}
