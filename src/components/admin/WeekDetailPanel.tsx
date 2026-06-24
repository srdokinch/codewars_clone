"use client";

import { useState } from "react";
import { getProblemsByWeek } from "@/lib/problems";
import type { WeekDetail } from "@/types/admin";
import WeekMemberCard from "./WeekMemberCard";

interface WeekDetailPanelProps {
  weekId: number;
  detail: WeekDetail;
}

export default function WeekDetailPanel({
  weekId,
  detail,
}: WeekDetailPanelProps) {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(
    null
  );
  const problemCount = getProblemsByWeek(weekId).length;

  const toggleMember = (memberId: string) => {
    setExpandedMemberId((prev) => (prev === memberId ? null : memberId));
  };

  if (detail.members.length === 0) {
    return (
      <p className="py-4 text-sm text-codewars-muted">
        まだメンバーのデータがありません。
      </p>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      {detail.members.map((member) => (
        <WeekMemberCard
          key={member.id}
          member={member}
          weekId={weekId}
          problemCount={problemCount}
          isExpanded={expandedMemberId === member.id}
          onToggle={() => toggleMember(member.id)}
        />
      ))}
    </div>
  );
}
