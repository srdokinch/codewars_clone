import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeek, getProblemsByWeek, hasProblems } from "@/lib/problems";
import WeekSidebar from "@/components/layout/WeekSidebar";
import LevelBadge from "@/components/ui/LevelBadge";

interface WeekPageProps {
  params: Promise<{ weekId: string }>;
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { weekId } = await params;
  const weekNum = Number(weekId);
  const week = getWeek(weekNum);

  if (!week) notFound();
  if (!hasProblems(weekNum)) notFound();

  const problems = getProblemsByWeek(weekNum);
  const basicProblems = problems.filter((p) => p.level === "basic");
  const advancedProblems = problems.filter((p) => p.level === "advanced");

  return (
    <div className="flex min-h-screen">
      <WeekSidebar currentWeek={weekNum} />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-codewars-border bg-codewars-surface px-8 py-6">
          <span className="font-mono text-sm text-codewars-accent">
            WEEK {week.id}
          </span>
          <h1 className="mt-1 text-2xl font-bold">{week.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-codewars-muted">
            {week.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {week.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-codewars-border bg-codewars-bg px-3 py-1 text-xs text-codewars-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="p-8">
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-codewars-muted">
              基本問題
            </h2>
            <div className="space-y-2">
              {basicProblems.map((problem, i) => (
                <Link
                  key={problem.id}
                  href={`/week/${weekNum}/${problem.id}`}
                  className="flex items-center gap-4 rounded-md border border-codewars-border bg-codewars-surface px-5 py-4 transition-colors hover:border-codewars-accent/50 hover:bg-codewars-panel/30"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-codewars-panel font-mono text-sm text-codewars-muted">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{problem.title}</p>
                  </div>
                  <LevelBadge level={problem.level} />
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-codewars-muted">
              応用問題
            </h2>
            <div className="space-y-2">
              {advancedProblems.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/week/${weekNum}/${problem.id}`}
                  className="flex items-center gap-4 rounded-md border border-codewars-accent/20 bg-codewars-surface px-5 py-4 transition-colors hover:border-codewars-accent/50 hover:bg-codewars-accent/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-codewars-accent/20 font-mono text-sm text-codewars-accent">
                    ★
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{problem.title}</p>
                  </div>
                  <LevelBadge level={problem.level} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
