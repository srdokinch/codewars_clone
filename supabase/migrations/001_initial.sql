-- members（仮名のみ。メール列なし）
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 認証用パスワード（Service Role のみアクセス）
CREATE TABLE public.member_credentials (
  member_id uuid PRIMARY KEY REFERENCES public.members (id) ON DELETE CASCADE,
  auth_password text NOT NULL
);

REVOKE ALL ON public.member_credentials FROM anon, authenticated;

-- 招待コード（平文は保存しない）
CREATE TABLE public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text UNIQUE NOT NULL,
  member_id uuid REFERENCES public.members (id) ON DELETE SET NULL,
  intended_role text NOT NULL DEFAULT 'member' CHECK (intended_role IN ('member', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.invite_codes FROM anon, authenticated;

-- 実行イベント
CREATE TABLE public.problem_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members (id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  success boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX problem_attempts_member_id_idx ON public.problem_attempts (member_id);

-- 集計キャッシュ
CREATE TABLE public.problem_progress (
  member_id uuid NOT NULL REFERENCES public.members (id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  is_solved boolean NOT NULL DEFAULT false,
  attempt_count int NOT NULL DEFAULT 0,
  success_count int NOT NULL DEFAULT 0,
  first_solved_at timestamptz,
  last_attempted_at timestamptz,
  PRIMARY KEY (member_id, problem_id)
);

-- RLS 有効化
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_progress ENABLE ROW LEVEL SECURITY;

-- 管理者判定ヘルパー
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.members
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 現在のメンバー ID
CREATE OR REPLACE FUNCTION public.current_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.members WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- members ポリシー
CREATE POLICY members_select_own ON public.members
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY members_update_own ON public.members
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid() AND role = (SELECT role FROM public.members WHERE auth_user_id = auth.uid()));

-- problem_attempts: INSERT のみ（自分の member_id）
CREATE POLICY problem_attempts_select ON public.problem_attempts
  FOR SELECT TO authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());

CREATE POLICY problem_attempts_insert ON public.problem_attempts
  FOR INSERT TO authenticated
  WITH CHECK (member_id = public.current_member_id());

-- problem_progress
CREATE POLICY problem_progress_select ON public.problem_progress
  FOR SELECT TO authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());

CREATE POLICY problem_progress_insert ON public.problem_progress
  FOR INSERT TO authenticated
  WITH CHECK (member_id = public.current_member_id());

CREATE POLICY problem_progress_update ON public.problem_progress
  FOR UPDATE TO authenticated
  USING (member_id = public.current_member_id())
  WITH CHECK (member_id = public.current_member_id());

-- 試行記録 RPC（attempts INSERT + progress UPSERT を一括）
CREATE OR REPLACE FUNCTION public.record_problem_attempt(
  p_problem_id text,
  p_success boolean
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

  INSERT INTO public.problem_attempts (member_id, problem_id, success)
  VALUES (v_member_id, p_problem_id, p_success);

  INSERT INTO public.problem_progress (
    member_id,
    problem_id,
    is_solved,
    attempt_count,
    success_count,
    first_solved_at,
    last_attempted_at
  )
  VALUES (
    v_member_id,
    p_problem_id,
    p_success,
    1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (member_id, problem_id) DO UPDATE SET
    attempt_count = problem_progress.attempt_count + 1,
    success_count = problem_progress.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    last_attempted_at = now(),
    is_solved = problem_progress.is_solved OR EXCLUDED.is_solved,
    first_solved_at = COALESCE(
      problem_progress.first_solved_at,
      CASE WHEN p_success THEN now() ELSE NULL END
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_problem_attempt(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_member_id() TO authenticated;

-- 管理者ダッシュボード用 RPC
CREATE OR REPLACE FUNCTION public.get_admin_dashboard()
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

  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT
      m.id,
      m.display_name,
      m.role,
      m.created_at,
      COALESCE(SUM(pp.attempt_count), 0)::int AS total_attempts,
      COALESCE(SUM(pp.success_count), 0)::int AS total_successes,
      COALESCE(SUM(CASE WHEN pp.is_solved THEN 1 ELSE 0 END), 0)::int AS solved_count,
      MAX(pp.last_attempted_at) AS last_activity_at
    FROM public.members m
    LEFT JOIN public.problem_progress pp ON pp.member_id = m.id
    GROUP BY m.id, m.display_name, m.role, m.created_at
    ORDER BY m.display_name
  ) t;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard() TO authenticated;
