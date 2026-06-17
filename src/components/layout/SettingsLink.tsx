import Link from "next/link";

export default function SettingsLink() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Link
        href="/settings"
        className="flex items-center gap-2 rounded-md border border-codewars-border bg-codewars-surface px-3 py-2 text-sm text-codewars-muted shadow-sm transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
        aria-label="設定"
      >
        <span aria-hidden="true">⚙️</span>
        <span>設定</span>
      </Link>
    </div>
  );
}
