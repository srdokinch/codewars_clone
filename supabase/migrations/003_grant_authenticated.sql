-- authenticated ロールへのテーブル権限
-- （Automatically expose new tables OFF 時に必要）
GRANT SELECT, UPDATE ON public.members TO authenticated;
GRANT SELECT, INSERT ON public.problem_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.problem_progress TO authenticated;

-- クライアントから自分のメンバー情報を取得（RLS + 権限問題を回避）
CREATE OR REPLACE FUNCTION public.get_current_member()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'display_name', m.display_name,
    'role', m.role
  )
  INTO result
  FROM public.members m
  WHERE m.auth_user_id = auth.uid()
  LIMIT 1;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_member() TO authenticated;
