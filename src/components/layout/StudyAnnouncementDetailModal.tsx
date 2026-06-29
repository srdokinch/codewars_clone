"use client";

import { useEffect, useId } from "react";
import {
  formatSessionDate,
  getDaysUntilLabel,
} from "@/lib/study-announcement";
import type { StudyAnnouncement } from "@/types";

interface StudyAnnouncementDetailModalProps {
  open: boolean;
  announcement: StudyAnnouncement;
  onClose: () => void;
}

export default function StudyAnnouncementDetailModal({
  open,
  announcement,
  onClose,
}: StudyAnnouncementDetailModalProps) {
  const titleId = useId();
  const contentId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={contentId}
        className="relative w-full max-w-md rounded-lg border border-codewars-border bg-codewars-surface p-6 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold text-codewars-text">
          次回勉強会
        </h2>
        <div id={contentId} className="mt-3 max-h-[60vh] overflow-y-auto">
          {announcement.nextSessionDate ? (
            <>
              <p className="text-sm font-semibold text-codewars-text">
                {formatSessionDate(announcement.nextSessionDate)}
              </p>
              <p className="text-xs text-codewars-accent">
                {getDaysUntilLabel(announcement.nextSessionDate)}
              </p>
            </>
          ) : (
            <p className="text-sm text-codewars-muted">日付は未設定です</p>
          )}
          {announcement.memo.trim() && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-codewars-muted">
              {announcement.memo}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-codewars-border bg-codewars-bg px-4 py-2 text-sm text-codewars-muted transition-colors hover:bg-codewars-panel/50 hover:text-codewars-text"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
