import { createClient } from "@/lib/supabase/client";
import type { StudyAnnouncement } from "@/types";

export const STUDY_ANNOUNCEMENT_UPDATED_EVENT = "dojo:study-announcement-updated";

const EMPTY_ANNOUNCEMENT: StudyAnnouncement = {
  nextSessionDate: null,
  memo: "",
  updatedAt: null,
};

interface StudyAnnouncementRow {
  next_session_date?: string | null;
  memo?: string;
  updated_at?: string | null;
}

function parseAnnouncement(data: unknown): StudyAnnouncement {
  if (!data || typeof data !== "object") {
    return EMPTY_ANNOUNCEMENT;
  }

  const row = data as StudyAnnouncementRow;
  return {
    nextSessionDate: row.next_session_date ?? null,
    memo: row.memo ?? "",
    updatedAt: row.updated_at ?? null,
  };
}

export async function fetchStudyAnnouncement(): Promise<StudyAnnouncement> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return EMPTY_ANNOUNCEMENT;
  }

  const { data, error } = await supabase.rpc("get_study_announcement");

  if (error) {
    console.error("Failed to fetch study announcement:", error.message);
    return EMPTY_ANNOUNCEMENT;
  }

  return parseAnnouncement(data);
}

export async function updateStudyAnnouncement(
  announcement: Pick<StudyAnnouncement, "nextSessionDate" | "memo">
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です" };
  }

  const { error } = await supabase.rpc("update_study_announcement", {
    p_next_session_date: announcement.nextSessionDate,
    p_memo: announcement.memo,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STUDY_ANNOUNCEMENT_UPDATED_EVENT));
  }

  return { success: true };
}

export function formatSessionDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function getDaysUntilSession(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysUntilLabel(dateStr: string): string {
  const days = getDaysUntilSession(dateStr);
  if (days > 0) return `あと${days}日`;
  if (days === 0) return "今日";
  return "開催済み";
}
