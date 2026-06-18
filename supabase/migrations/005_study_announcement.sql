-- 勉強会の次回日付・メモ（シングルトン1行）
CREATE TABLE public.study_announcement (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  next_session_date date,
  memo text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.members (id)
);

INSERT INTO public.study_announcement (id) VALUES (1);

ALTER TABLE public.study_announcement ENABLE ROW LEVEL SECURITY;

CREATE POLICY study_announcement_select ON public.study_announcement
  FOR SELECT TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.get_study_announcement()
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
    'next_session_date', sa.next_session_date,
    'memo', sa.memo,
    'updated_at', sa.updated_at
  )
  INTO result
  FROM public.study_announcement sa
  WHERE sa.id = 1;

  RETURN COALESCE(
    result,
    json_build_object(
      'next_session_date', NULL,
      'memo', '',
      'updated_at', NULL
    )
  );
END;
$$;

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

GRANT SELECT ON public.study_announcement TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_study_announcement() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_study_announcement(date, text) TO authenticated;
