-- 管理者: 週別（問題IDリスト指定）のメンバー進捗
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
                latest_test_results
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
