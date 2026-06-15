import Link from "next/link";
import { getWeeks, getAvailableWeeks, getProblemsByWeek } from "@/lib/problems";
import WeekSidebar from "@/components/layout/WeekSidebar";

export default function HomePage() {
  const weeks = getWeeks();
  const availableWeeks = getAvailableWeeks();

  return (
    <div className="flex min-h-screen">
      <WeekSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-codewars-border bg-codewars-surface px-8 py-6">
          <h1 className="text-2xl font-bold">JavaScript Dojo</h1>
          <p className="mt-2 max-w-2xl text-sm text-codewars-muted">
            HTML/CSSコーダー向けのJavaScript基礎学習サイトです。
            Weekごとに問題を解きながら、React/Next.jsへのステップアップを目指しましょう。
          </p>
        </div>

        <div className="grid gap-4 p-8 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week) => {
            const isAvailable = availableWeeks.includes(week.id);
            const problemCount = isAvailable
              ? getProblemsByWeek(week.id).length
              : 0;

            if (!isAvailable) {
              return (
                <div
                  key={week.id}
                  className="rounded-lg border border-codewars-border bg-codewars-surface/50 p-5 opacity-50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-codewars-muted">
                      WEEK {week.id}
                    </span>
                    <span className="rounded bg-codewars-border px-2 py-0.5 text-xs text-codewars-muted">
                      準備中
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">{week.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-codewars-muted">
                    {week.description}
                  </p>
                </div>
              );
            }

            return (
              <Link
                key={week.id}
                href={`/week/${week.id}`}
                className="group rounded-lg border border-codewars-border bg-codewars-surface p-5 transition-all hover:border-codewars-accent/50 hover:shadow-lg hover:shadow-codewars-accent/5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-codewars-accent">
                    WEEK {week.id}
                  </span>
                  <span className="text-xs text-codewars-muted">
                    {problemCount} 問
                  </span>
                </div>
                <h2 className="text-lg font-semibold group-hover:text-codewars-accent">
                  {week.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-codewars-muted">
                  {week.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {week.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="rounded bg-codewars-bg px-2 py-0.5 text-xs text-codewars-muted"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
