import { createClient } from "@/lib/supabase/client";

export const PROBLEM_MEMO_MAX_LENGTH = 1000;

export interface ProblemMemo {
  memo: string;
  memoUpdatedAt: string | null;
}

const EMPTY_MEMO: ProblemMemo = {
  memo: "",
  memoUpdatedAt: null,
};

interface ProblemMemoRow {
  memo?: string;
  memo_updated_at?: string | null;
}

function parseMemo(data: unknown): ProblemMemo {
  if (!data || typeof data !== "object") {
    return EMPTY_MEMO;
  }

  const row = data as ProblemMemoRow;
  return {
    memo: row.memo ?? "",
    memoUpdatedAt: row.memo_updated_at ?? null,
  };
}

export async function fetchProblemMemo(
  problemId: string
): Promise<ProblemMemo | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_problem_memo", {
    p_problem_id: problemId,
  });

  if (error) {
    console.error("Failed to fetch problem memo:", error.message);
    return EMPTY_MEMO;
  }

  return parseMemo(data);
}

export async function saveProblemMemo(
  problemId: string,
  memo: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "ログインが必要です" };
  }

  const { error } = await supabase.rpc("upsert_problem_memo", {
    p_problem_id: problemId,
    p_memo: memo,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
