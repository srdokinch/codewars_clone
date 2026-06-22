import Link from "next/link";
import SidebarFooter from "@/components/layout/SidebarFooter";
import StudyAnnouncementBanner from "@/components/layout/StudyAnnouncementBanner";
import { getWeeks, getAvailableWeeks } from "@/lib/problems";

export default function WeekSidebar({ currentWeek }: { currentWeek?: number }) {
  const weeks = getWeeks();
  const availableWeeks = getAvailableWeeks();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-codewars-border bg-codewars-surface">
      <div className="border-b border-codewars-border p-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-bold text-codewars-accent">JS</span>
          <span className="text-sm font-semibold text-codewars-text group-hover:text-codewars-accent">
            Dojo
          </span>
        </Link>
      </div>

      <StudyAnnouncementBanner />

      <nav className="scrollbar-thin flex-1 overflow-y-auto p-2">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-codewars-muted">
          Weeks
        </p>
        <ul className="space-y-0.5">
          {weeks.map((week) => {
            const isAvailable = availableWeeks.includes(week.id);
            const isActive = currentWeek === week.id;

            if (!isAvailable) {
              return (
                <li key={week.id}>
                  <span className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-codewars-disabled">
                    <span className="w-6 text-xs">W{week.id}</span>
                    <span className="truncate">{week.title}</span>
                    <span className="ml-auto text-xs">準備中</span>
                  </span>
                </li>
              );
            }

            return (
              <li key={week.id}>
                <Link
                  href={`/week/${week.id}`}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-codewars-panel text-codewars-accent"
                      : "text-codewars-muted hover:bg-codewars-panel/50 hover:text-codewars-text"
                  }`}
                >
                  <span className="w-6 text-xs font-mono">W{week.id}</span>
                  <span className="truncate">{week.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarFooter />
    </aside>
  );
}
