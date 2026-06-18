import Link from "next/link";
import WeekSidebar from "@/components/layout/WeekSidebar";
import ProgressSettings from "@/components/settings/ProgressSettings";
import StudyAnnouncementSettings from "@/components/settings/StudyAnnouncementSettings";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <WeekSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-codewars-border bg-codewars-surface px-8 py-6">
          <Link
            href="/"
            className="text-sm text-codewars-muted hover:text-codewars-accent"
          >
            ← ホーム
          </Link>
          <h1 className="mt-2 text-2xl font-bold">設定</h1>
          <p className="mt-2 max-w-2xl text-sm text-codewars-muted">
            学習データの管理やその他の設定を行います。
          </p>
        </div>

        <div className="space-y-6 p-8">
          <StudyAnnouncementSettings />
          <ProgressSettings />
        </div>
      </main>
    </div>
  );
}
