import { notFound } from "next/navigation";
import { getProblem, getProblemsByWeek } from "@/lib/problems";
import WeekSidebar from "@/components/layout/WeekSidebar";
import ProblemWorkspace from "@/components/ProblemWorkspace";

interface ProblemPageProps {
  params: Promise<{ weekId: string; problemId: string }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { weekId, problemId } = await params;
  const weekNum = Number(weekId);
  const problem = getProblem(problemId);

  if (!problem || problem.week !== weekNum) notFound();

  const problems = getProblemsByWeek(weekNum);

  return (
    <div className="flex h-screen">
      <WeekSidebar currentWeek={weekNum} />
      <ProblemWorkspace
        key={problem.id}
        problem={problem}
        problems={problems}
      />
    </div>
  );
}
