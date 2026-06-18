"use client";

import { useMemberAuth } from "@/hooks/useMemberAuth";
import { useProgressMigration } from "@/hooks/useProgressMigration";

export default function ProgressMigrationRunner() {
  const { isLoggedIn, isLoading } = useMemberAuth();
  useProgressMigration(isLoggedIn, isLoading);
  return null;
}
