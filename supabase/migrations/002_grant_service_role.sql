-- service_role にテーブル操作権限を付与
-- （Automatically expose new tables OFF の場合に必要）
GRANT ALL ON public.invite_codes TO service_role;
GRANT ALL ON public.member_credentials TO service_role;
GRANT ALL ON public.members TO service_role;
