"use client";

import { useEffect, useRef } from "react";
import {
  fetchCurrentMemberId,
  hydrateLocalProgressFromCloud,
  migrateLocalProgressToCloud,
} from "@/lib/progress-migrate";

export function useProgressMigration(
  isLoggedIn: boolean,
  isLoading: boolean
): void {
  const runningRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || isLoading || runningRef.current) return;

    runningRef.current = true;

    void (async () => {
      try {
        const memberId = await fetchCurrentMemberId();
        if (!memberId) return;

        await migrateLocalProgressToCloud(memberId);
        await hydrateLocalProgressFromCloud();
      } finally {
        runningRef.current = false;
      }
    })();
  }, [isLoggedIn, isLoading]);
}
