"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface MemberAuthState {
  isLoggedIn: boolean;
  displayName: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMemberAuth(): MemberAuthState {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuth = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      setDisplayName(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoggedIn(true);

    const { data: member, error } = await supabase.rpc("get_current_member");

    if (error) {
      console.error("Failed to load member:", error.message);
      setDisplayName(null);
      setIsAdmin(false);
    } else if (member && typeof member === "object") {
      const profile = member as { display_name?: string; role?: string };
      setDisplayName(profile.display_name ?? null);
      setIsAdmin(profile.role === "admin");
    } else {
      setDisplayName(null);
      setIsAdmin(false);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    void loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAuth();
    });

    return () => subscription.unsubscribe();
  }, [loadAuth]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setDisplayName(null);
    setIsAdmin(false);
    router.refresh();
  }, [router]);

  return {
    isLoggedIn,
    displayName,
    isAdmin,
    isLoading,
    logout,
    refresh: loadAuth,
  };
}
