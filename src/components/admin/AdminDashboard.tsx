"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAvailableWeeks,
  getProblemsByWeek,
  getWeek,
} from "@/lib/problems";
import type { DashboardMember, MemberDetail, WeekDetail } from "@/types/admin";
import MemberDetailPanel from "./MemberDetailPanel";
import WeekCard from "./WeekCard";

type ViewMode = "week" | "member";

interface AdminDashboardProps {
  members: DashboardMember[];
  totalProblems: number;
}

export default function AdminDashboard({
  members,
  totalProblems,
}: AdminDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  return (
    <div className="p-8">
      <div className="mb-6 flex gap-2 border-b border-codewars-border">
        <TabButton
          active={viewMode === "week"}
          onClick={() => setViewMode("week")}
        >
          週別
        </TabButton>
        <TabButton
          active={viewMode === "member"}
          onClick={() => setViewMode("member")}
        >
          メンバー別
        </TabButton>
      </div>

      {viewMode === "week" ? (
        <WeekView />
      ) : (
        <MemberView members={members} totalProblems={totalProblems} />
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-codewars-accent text-codewars-text"
          : "border-transparent text-codewars-muted hover:text-codewars-text"
      }`}
    >
      {children}
    </button>
  );
}

function WeekView() {
  const availableWeeks = getAvailableWeeks();
  const [expandedWeekId, setExpandedWeekId] = useState<number | null>(null);
  const [weekDetails, setWeekDetails] = useState<Record<number, WeekDetail>>(
    {}
  );
  const [loadingWeekId, setLoadingWeekId] = useState<number | null>(null);
  const [errorWeekId, setErrorWeekId] = useState<number | null>(null);

  const loadWeekDetail = useCallback(
    async (weekId: number) => {
      if (weekDetails[weekId]) return;

      setLoadingWeekId(weekId);
      setErrorWeekId(null);

      const problemIds = getProblemsByWeek(weekId).map((p) => p.id);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_admin_week_detail", {
        p_problem_ids: problemIds,
      });

      setLoadingWeekId(null);

      if (error) {
        setErrorWeekId(weekId);
        return;
      }

      setWeekDetails((prev) => ({
        ...prev,
        [weekId]: data as WeekDetail,
      }));
    },
    [weekDetails]
  );

  const toggleWeek = async (weekId: number) => {
    if (expandedWeekId === weekId) {
      setExpandedWeekId(null);
      return;
    }

    setExpandedWeekId(weekId);
    await loadWeekDetail(weekId);
  };

  return (
    <div className="space-y-3">
      {availableWeeks.map((weekId) => {
        const week = getWeek(weekId);
        const problemCount = getProblemsByWeek(weekId).length;
        const isExpanded = expandedWeekId === weekId;
        const detail = weekDetails[weekId];
        const isLoading = loadingWeekId === weekId;
        const hasError = errorWeekId === weekId;

        return (
          <WeekCard
            key={weekId}
            weekId={weekId}
            weekTitle={week?.title ?? ""}
            problemCount={problemCount}
            isExpanded={isExpanded}
            isLoading={isLoading}
            hasError={hasError}
            detail={detail}
            onToggle={() => void toggleWeek(weekId)}
          />
        );
      })}
    </div>
  );
}

interface MemberViewProps {
  members: DashboardMember[];
  totalProblems: number;
}

function MemberView({ members, totalProblems }: MemberViewProps) {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<
    Record<string, MemberDetail>
  >({});
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [errorMemberId, setErrorMemberId] = useState<string | null>(null);

  const loadMemberDetail = useCallback(
    async (memberId: string) => {
      if (memberDetails[memberId]) return;

      setLoadingMemberId(memberId);
      setErrorMemberId(null);

      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_admin_member_detail", {
        p_member_id: memberId,
      });

      setLoadingMemberId(null);

      if (error) {
        setErrorMemberId(memberId);
        return;
      }

      setMemberDetails((prev) => ({
        ...prev,
        [memberId]: data as MemberDetail,
      }));
    },
    [memberDetails]
  );

  const toggleMember = async (memberId: string) => {
    if (expandedMemberId === memberId) {
      setExpandedMemberId(null);
      return;
    }

    setExpandedMemberId(memberId);
    await loadMemberDetail(memberId);
  };

  return (
    <div className="overflow-x-auto">
      {members.length === 0 ? (
        <p className="text-codewars-muted">まだメンバーのデータがありません。</p>
      ) : (
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-codewars-border text-codewars-muted">
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 font-medium">表示名</th>
              <th className="px-4 py-3 font-medium">クリア数</th>
              <th className="px-4 py-3 font-medium">正誤率</th>
              <th className="px-4 py-3 font-medium">試行回数</th>
              <th className="px-4 py-3 font-medium">最終活動</th>
              <th className="px-4 py-3 font-medium">ロール</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const accuracy =
                member.total_attempts > 0
                  ? Math.round(
                      (member.total_successes / member.total_attempts) * 100
                    )
                  : null;
              const isExpanded = expandedMemberId === member.id;
              const detail = memberDetails[member.id];
              const isLoading = loadingMemberId === member.id;
              const hasError = errorMemberId === member.id;

              return (
                <MemberRow
                  key={member.id}
                  member={member}
                  totalProblems={totalProblems}
                  accuracy={accuracy}
                  isExpanded={isExpanded}
                  isLoading={isLoading}
                  hasError={hasError}
                  detail={detail}
                  onToggle={() => void toggleMember(member.id)}
                />
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

interface MemberRowProps {
  member: DashboardMember;
  totalProblems: number;
  accuracy: number | null;
  isExpanded: boolean;
  isLoading: boolean;
  hasError: boolean;
  detail: MemberDetail | undefined;
  onToggle: () => void;
}

function MemberRow({
  member,
  totalProblems,
  accuracy,
  isExpanded,
  isLoading,
  hasError,
  detail,
  onToggle,
}: MemberRowProps) {
  return (
    <>
      <tr className="border-b border-codewars-border/50 hover:bg-codewars-surface/50">
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="text-codewars-muted hover:text-codewars-text"
            aria-expanded={isExpanded}
            aria-label={`${member.display_name} の詳細を${isExpanded ? "閉じる" : "開く"}`}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </td>
        <td className="px-4 py-3 font-medium">{member.display_name}</td>
        <td className="px-4 py-3 font-mono">
          {member.solved_count} / {totalProblems}
        </td>
        <td className="px-4 py-3 font-mono">
          {accuracy !== null ? `${accuracy}%` : "—"}
        </td>
        <td className="px-4 py-3 font-mono">{member.total_attempts}</td>
        <td className="px-4 py-3 text-codewars-muted">
          {member.last_activity_at
            ? new Date(member.last_activity_at).toLocaleString("ja-JP")
            : "—"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              member.role === "admin"
                ? "bg-codewars-accent/20 text-codewars-accent"
                : "bg-codewars-border text-codewars-muted"
            }`}
          >
            {member.role === "admin" ? "管理者" : "メンバー"}
          </span>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-codewars-border/50">
          <td colSpan={7} className="p-0">
            {isLoading && (
              <p className="px-8 py-4 text-sm text-codewars-muted">
                読み込み中...
              </p>
            )}
            {hasError && (
              <p className="px-8 py-4 text-sm text-codewars-accent">
                詳細の読み込みに失敗しました。
              </p>
            )}
            {detail && !isLoading && !hasError && (
              <MemberDetailPanel detail={detail} />
            )}
          </td>
        </tr>
      )}
    </>
  );
}
