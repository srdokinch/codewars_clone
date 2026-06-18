import { notFound } from "next/navigation";
import {
  getWeek,
  getProblemsByWeek,
  hasProblems,
  groupProblemsBySection,
} from "@/lib/problems";
import PageHeader from "@/components/layout/PageHeader";
import WeekSidebar from "@/components/layout/WeekSidebar";
import ScrollToHash from "@/components/layout/ScrollToHash";
import WeekProblemList from "@/components/week/WeekProblemList";

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
  const basicSections = groupProblemsBySection(basicProblems);
  const hasSections = basicProblems.some((p) => p.section);

  return (
    <div className="flex min-h-screen">
      <WeekSidebar currentWeek={weekNum} />

      <main className="flex-1 overflow-y-auto">
        <ScrollToHash />
        <PageHeader>
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
        </PageHeader>

        <div className="p-8">
          {hasSections ? (
            basicSections.map((section, index) => (
              <section
                key={section.label}
                className={index < basicSections.length - 1 ? "mb-8" : ""}
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-codewars-muted">
                  {section.label}
                </h2>
                <WeekProblemList
                  problems={section.problems}
                  weekNum={weekNum}
                  numbered
                />
              </section>
            ))
          ) : (
            <section className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-codewars-muted">
                基本問題
              </h2>
              <WeekProblemList
                problems={basicProblems}
                weekNum={weekNum}
                numbered
              />
            </section>
          )}

          {advancedProblems.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-codewars-muted">
                応用問題
              </h2>
              <WeekProblemList
                problems={advancedProblems}
                weekNum={weekNum}
                variant="advanced"
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
