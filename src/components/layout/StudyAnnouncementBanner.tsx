"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useMemberAuth } from "@/hooks/useMemberAuth";
import {
  fetchStudyAnnouncement,
  formatSessionDate,
  getDaysUntilLabel,
  STUDY_ANNOUNCEMENT_UPDATED_EVENT,
} from "@/lib/study-announcement";
import type { StudyAnnouncement } from "@/types";

export default function StudyAnnouncementBanner() {
  const { isLoggedIn, isLoading: isAuthLoading } = useMemberAuth();
  const [announcement, setAnnouncement] = useState<StudyAnnouncement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchStudyAnnouncement();
    setAnnouncement(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setAnnouncement(null);
      return;
    }

    void load();

    const handleRefresh = () => {
      void load();
    };

    window.addEventListener(STUDY_ANNOUNCEMENT_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(STUDY_ANNOUNCEMENT_UPDATED_EVENT, handleRefresh);
    };
  }, [isLoggedIn, load]);

  if (isAuthLoading || !isLoggedIn) {
    return null;
  }

  const hasContent =
    announcement &&
    (announcement.nextSessionDate || announcement.memo.trim().length > 0);

  if (isLoading && !announcement) {
    return (
      <div className="border-b border-codewars-border px-4 py-3">
        <p className="text-xs text-codewars-muted">読み込み中...</p>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="border-b border-codewars-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-codewars-muted">
          次回勉強会
        </p>
        <p className="mt-1 text-sm text-codewars-muted">日付は未設定です</p>
        <Link
          href="/settings"
          className="mt-1 inline-block text-xs text-codewars-accent hover:underline"
        >
          設定から入力
        </Link>
      </div>
    );
  }

  return (
    <div className="border-b border-codewars-border px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-codewars-muted">
        次回勉強会
      </p>
      {announcement?.nextSessionDate ? (
        <>
          <p className="mt-1 text-sm font-semibold text-codewars-text">
            {formatSessionDate(announcement.nextSessionDate)}
          </p>
          <p className="text-xs text-codewars-accent">
            {getDaysUntilLabel(announcement.nextSessionDate)}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-codewars-muted">日付は未設定です</p>
      )}
      {announcement?.memo.trim() && (
        <p className="mt-2 line-clamp-2 text-xs text-codewars-muted">
          {announcement.memo}
        </p>
      )}
    </div>
  );
}
