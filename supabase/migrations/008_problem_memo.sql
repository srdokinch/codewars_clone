-- 問題ごとの学習メモ（problem_progress に列追加）
ALTER TABLE public.problem_progress
  ADD COLUMN IF NOT EXISTS memo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS memo_updated_at timestamptz;

-- 自分のメモ取得
CREATE OR REPLACE FUNCTION public.get_problem_memo(p_problem_id text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  v_member_id uuid;
BEGIN
  v_member_id := public.current_member_id();
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  SELECT json_build_object(
    'memo', COALESCE(pp.memo, ''),
    'memo_updated_at', pp.memo_updated_at
  )
  INTO result
  FROM public.problem_progress pp
  WHERE pp.member_id = v_member_id
    AND pp.problem_id = p_problem_id;

  RETURN COALESCE(
    result,
    json_build_object('memo', '', 'memo_updated_at', NULL)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_problem_memo(text) TO authenticated;

-- メモ保存（試行前でも行を作成可能）
CREATE OR REPLACE FUNCTION public.upsert_problem_memo(
  p_problem_id text,
  p_memo text
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

  IF char_length(COALESCE(p_memo, '')) > 1000 THEN
    RAISE EXCEPTION 'Memo must be 1000 characters or less';
  END IF;

  INSERT INTO public.problem_progress (
    member_id,
    problem_id,
    is_solved,
    attempt_count,
    success_count,
    memo,
    memo_updated_at
  )
  VALUES (
    v_member_id,
    p_problem_id,
    false,
    0,
    0,
    COALESCE(p_memo, ''),
    now()
  )
  ON CONFLICT (member_id, problem_id) DO UPDATE SET
    memo = EXCLUDED.memo,
    memo_updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_problem_memo(text, text) TO authenticated;

-- 管理者: メンバー別詳細にメモ列を追加
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
          latest_test_results,
          memo,
          memo_updated_at
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

-- 管理者: 週別詳細にメモ列を追加
CREATE OR REPLACE FUNCTION public.get_admin_week_detail(p_problem_ids text[])
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
    'members', COALESCE((
      SELECT json_agg(row_to_json(m) ORDER BY m.display_name)
      FROM (
        SELECT
          mem.id,
          mem.display_name,
          mem.role,
          COALESCE(SUM(CASE WHEN pp.is_solved THEN 1 ELSE 0 END), 0)::int AS solved_count,
          COALESCE(SUM(pp.attempt_count), 0)::int AS total_attempts,
          COALESCE(SUM(pp.success_count), 0)::int AS total_successes,
          MAX(pp.last_attempted_at) AS last_activity_at,
          COALESCE((
            SELECT json_agg(row_to_json(p) ORDER BY p.problem_id)
            FROM (
              SELECT
                problem_id,
                is_solved,
                attempt_count,
                success_count,
                hints_revealed,
                last_attempted_at,
                latest_test_results,
                memo,
                memo_updated_at
              FROM public.problem_progress
              WHERE member_id = mem.id
                AND problem_id = ANY(p_problem_ids)
            ) p
          ), '[]'::json) AS progress,
          COALESCE((
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
              WHERE member_id = mem.id
                AND problem_id = ANY(p_problem_ids)
            ) a
          ), '[]'::json) AS attempts
        FROM public.members mem
        LEFT JOIN public.problem_progress pp
          ON pp.member_id = mem.id
          AND pp.problem_id = ANY(p_problem_ids)
        GROUP BY mem.id, mem.display_name, mem.role
      ) m
    ), '[]'::json)
  )
  INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_week_detail(text[]) TO authenticated;
