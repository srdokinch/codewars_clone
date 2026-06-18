-- problem_attempts: 試行ごとの詳細
ALTER TABLE public.problem_attempts
  ADD COLUMN IF NOT EXISTS test_results jsonb,
  ADD COLUMN IF NOT EXISTS hints_revealed int NOT NULL DEFAULT 0;

-- problem_progress: 集計 + 最新スナップショット
ALTER TABLE public.problem_progress
  ADD COLUMN IF NOT EXISTS hints_revealed int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS latest_test_results jsonb;

-- 旧シグネチャを削除して拡張版に置き換え
DROP FUNCTION IF EXISTS public.record_problem_attempt(text, boolean);

CREATE OR REPLACE FUNCTION public.record_problem_attempt(
  p_problem_id text,
  p_success boolean,
  p_test_results jsonb DEFAULT NULL,
  p_hints_revealed int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id uuid;
BEGIN
  v_member_id := public.current_member_id();
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  INSERT INTO public.problem_attempts (
    member_id,
    problem_id,
    success,
    test_results,
    hints_revealed
  )
  VALUES (
    v_member_id,
    p_problem_id,
    p_success,
    p_test_results,
    p_hints_revealed
  );

  INSERT INTO public.problem_progress (
    member_id,
    problem_id,
    is_solved,
    attempt_count,
    success_count,
    first_solved_at,
    last_attempted_at,
    hints_revealed,
    latest_test_results
  )
  VALUES (
    v_member_id,
    p_problem_id,
    p_success,
    1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN now() ELSE NULL END,
    now(),
    p_hints_revealed,
    p_test_results
  )
  ON CONFLICT (member_id, problem_id) DO UPDATE SET
    attempt_count = problem_progress.attempt_count + 1,
    success_count = problem_progress.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    last_attempted_at = now(),
    is_solved = problem_progress.is_solved OR EXCLUDED.is_solved,
    first_solved_at = COALESCE(
      problem_progress.first_solved_at,
      CASE WHEN p_success THEN now() ELSE NULL END
    ),
    hints_revealed = GREATEST(problem_progress.hints_revealed, EXCLUDED.hints_revealed),
    latest_test_results = EXCLUDED.latest_test_results;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_problem_attempt(text, boolean, jsonb, int) TO authenticated;

-- ヒント使用のみ記録（実行なし）
CREATE OR REPLACE FUNCTION public.record_hint_usage(
  p_problem_id text,
  p_hints_revealed int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id uuid;
BEGIN
  v_member_id := public.current_member_id();
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  INSERT INTO public.problem_progress (
    member_id,
    problem_id,
    is_solved,
    attempt_count,
    success_count,
    hints_revealed
  )
  VALUES (
    v_member_id,
    p_problem_id,
    false,
    0,
    0,
    p_hints_revealed
  )
  ON CONFLICT (member_id, problem_id) DO UPDATE SET
    hints_revealed = GREATEST(problem_progress.hints_revealed, EXCLUDED.hints_revealed);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_hint_usage(text, int) TO authenticated;

-- 管理者: メンバー別の問題進捗・試行履歴
CREATE OR REPLACE FUNCTION public.get_admin_member_detail(p_member_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT json_build_object(
    'member', (
      SELECT row_to_json(m)
      FROM (
        SELECT id, display_name, role, created_at
        FROM public.members
        WHERE id = p_member_id
      ) m
    ),
    'progress', COALESCE((
      SELECT json_agg(row_to_json(p) ORDER BY p.problem_id)
      FROM (
        SELECT
          problem_id,
          is_solved,
          attempt_count,
          success_count,
          hints_revealed,
          last_attempted_at,
          latest_test_results
        FROM public.problem_progress
        WHERE member_id = p_member_id
      ) p
    ), '[]'::json),
    'attempts', COALESCE((
      SELECT json_agg(row_to_json(a) ORDER BY a.attempted_at DESC)
      FROM (
        SELECT
          id,
          problem_id,
          success,
          attempted_at,
          hints_revealed,
          test_results
        FROM public.problem_attempts
        WHERE member_id = p_member_id
      ) a
    ), '[]'::json)
  )
  INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_member_detail(uuid) TO authenticated;
