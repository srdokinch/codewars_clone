"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchStudyAnnouncement,
  STUDY_ANNOUNCEMENT_UPDATED_EVENT,
  updateStudyAnnouncement,
} from "@/lib/study-announcement";

export default function StudyAnnouncementSettings() {
  const [nextSessionDate, setNextSessionDate] = useState("");
  const [memo, setMemo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const announcement = await fetchStudyAnnouncement();
    setNextSessionDate(announcement.nextSessionDate ?? "");
    setMemo(announcement.memo);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener(STUDY_ANNOUNCEMENT_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(STUDY_ANNOUNCEMENT_UPDATED_EVENT, handleRefresh);
    };
  }, [load]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const result = await updateStudyAnnouncement({
      nextSessionDate: nextSessionDate || null,
      memo,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? "保存に失敗しました");
      return;
    }

    setMessage("保存しました。");
    await load();
  };

  return (
    <section className="rounded-lg border border-codewars-border bg-codewars-surface p-6">
      <h2 className="text-lg font-semibold">勉強会情報</h2>
      <p className="mt-2 text-sm text-codewars-muted">
        次回の勉強会の日付とメモを全員で共有します。
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-codewars-muted">読み込み中...</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="next-session-date"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-codewars-muted"
            >
              次回の日付
            </label>
            <input
              id="next-session-date"
              type="date"
              value={nextSessionDate}
              onChange={(event) => setNextSessionDate(event.target.value)}
              className="w-full max-w-xs rounded-md border border-codewars-border bg-codewars-bg px-3 py-2 text-sm text-codewars-text focus:border-codewars-accent focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="study-memo"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-codewars-muted"
            >
              メモ
            </label>
            <textarea
              id="study-memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="議題や持ち物など"
              className="w-full rounded-md border border-codewars-border bg-codewars-bg px-3 py-2 text-sm text-codewars-text placeholder:text-codewars-disabled focus:border-codewars-accent focus:outline-none"
            />
            <p className="mt-1 text-xs text-codewars-muted">{memo.length} / 500</p>
          </div>

          {message && (
            <p className="text-sm text-codewars-success">{message}</p>
          )}
          {error && <p className="text-sm text-codewars-warning">{error}</p>}

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-md border border-codewars-accent/50 bg-codewars-accent/10 px-4 py-2 text-sm font-semibold text-codewars-accent transition-colors hover:bg-codewars-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存する"}
          </button>
        </div>
      )}
    </section>
  );
}
