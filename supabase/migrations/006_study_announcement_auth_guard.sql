-- 勉強会お知らせの更新をログイン済みメンバーに限定
REVOKE EXECUTE ON FUNCTION public.update_study_announcement(date, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_study_announcement(date, text) FROM anon;

CREATE OR REPLACE FUNCTION public.update_study_announcement(
  p_next_session_date date,
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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_member_id := public.current_member_id();
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF char_length(COALESCE(p_memo, '')) > 500 THEN
    RAISE EXCEPTION 'Memo must be 500 characters or less';
  END IF;

  UPDATE public.study_announcement
  SET
    next_session_date = p_next_session_date,
    memo = COALESCE(p_memo, ''),
    updated_at = now(),
    updated_by = v_member_id
  WHERE id = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_study_announcement(date, text) TO authenticated;
