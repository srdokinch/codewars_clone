import { createClient } from "@/lib/supabase/client";

export async function recordProblemAttempt(
  problemId: string,
  success: boolean
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.rpc("record_problem_attempt", {
    p_problem_id: problemId,
    p_success: success,
  });

  if (error) {
    console.error("Failed to record progress:", error.message);
  }
}
