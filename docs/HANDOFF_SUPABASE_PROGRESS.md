# 引き継ぎ：Supabase 進捗共有機能

次のエージェント／担当者向けの引き継ぎドキュメントです。

## ブランチ・コミット

| 項目 | 内容 |
|------|------|
| ブランチ | `feature/supabase-progress-tracking`（`develop` から作成） |
| 最新コミット | `57f10dc` — 招待コード認証とSupabase進捗共有機能を追加 |
| 状態 | コミット済み・working tree clean |
| **未実施** | `develop` へのマージ、PR、本番デプロイ |

---

## 実装済み

### 認証（招待コード方式）

- `/join` — 招待コードでログイン（初回は表示名入力）
- ログイン後は `/join` がログアウト画面に切り替わる
- `POST /api/auth/join` — コード検証・セッション発行（Service Role）
- `POST /api/auth/logout` — ログアウト
- メールは使わず、`auth.users` には `{uuid}@dojo.internal` のみ

### UI（左下ナビ）

上から順:

1. **管理者ダッシュボード**（`role: admin` のみ）
2. **ログアウト**（ログイン後）/ **ログイン**（未ログイン）
3. **設定**

表示名の表示は削除済み。

### 進捗記録

- ログイン中にテスト実行 → `record_problem_attempt` RPC で Supabase に記録
- テストケース別 OK/NG・ヒント使用数も記録（解答コードは送らない）
- ヒント表示のみ → `record_hint_usage` RPC で記録
- 未ログインでも問題は解ける（従来どおり `localStorage` のみ）

### 管理者ダッシュボード

- `/admin` — 全メンバーの表示名・クリア数・正誤率・試行回数・最終活動
- メンバー行を展開 → Week 別の問題一覧（未着手 / 挑戦中 / クリア）
- 問題行を展開 → 試行履歴（日時・OK/NG・テストケース別結果・ヒント使用数）
- Middleware + `is_admin` RPC でガード

### DB・インフラ

| ファイル | 内容 |
|----------|------|
| `supabase/migrations/001_initial.sql` | テーブル・RLS・RPC |
| `supabase/migrations/002_grant_service_role.sql` | service_role への GRANT |
| `supabase/migrations/003_grant_authenticated.sql` | authenticated への GRANT + `get_current_member` RPC |
| `supabase/migrations/004_admin_problem_detail.sql` | 問題別詳細列 + `record_hint_usage` / `get_admin_member_detail` RPC |

### 運用ツール

- `scripts/generate-invite-codes.mjs` — 招待コード発行（`npm run generate-invite-codes`）
- `docs/SUPABASE_SETUP.md` — セットアップ手順
- `.env.example` — 環境変数テンプレート

### 採用しなかった方式

- メールマジックコード（プライバシー優先で招待コードを選択）
- Tier 2/3 セキュリティ（VPN、ログ定期削除など）

---

## 依頼者が済ませた作業

- Supabase プロジェクト作成
- `.env.local` 設定
- `001`・`002`・`003` マイグレーション実行
- 管理者用・メンバー用招待コード発行
- ログイン / ログアウト画面の動作確認

---

## 依頼者がこれから確認すべきこと

### 必須（E2E）

- [ ] **004 マイグレーション**を Supabase SQL Editor で実行
- [ ] **メンバー用コード**でログイン → 問題を実行（成功・失敗どちらでも）
- [ ] **管理者コード**で `/admin` を開き、メンバー行を展開して問題別詳細・試行履歴・ヒント使用が見えるか
- [ ] 管理者で左下に **「管理者ダッシュボード」** が表示されるか
- [ ] ログアウト → 同じコードで再ログインできるか

### デプロイ前

- [ ] `feature/supabase-progress-tracking` を `develop` にマージ（PR 作成）
- [ ] Vercel 等に `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY` を設定
- [ ] 本番 Supabase で 001〜004 を実行済みか確認
- [ ] 招待コードをメンバーに配布（対応表はスプレッドシート等で社外管理）

### 運用

- [ ] `generate-invite-codes` 実行前に `set -a && source .env.local && set +a` が必要（自動読み込み未実装）
- [ ] 退職時は `invite_codes.is_active = false` で無効化（`SUPABASE_SETUP.md` 参照）

### 既知の注意点

- **管理者リンク**は `--role admin` で**初回登録したアカウント**のみ。メンバー用コードで登録したアカウントには出ない
- `NEXT_PUBLIC_SUPABASE_URL` に `/rest/v1/` を付けない（`https://xxx.supabase.co` のみ）
- `.env.local` は Git 対象外（コミットしない）
- Supabase Security 設定の推奨: Data API ON / Automatically expose new tables OFF / automatic RLS ON

---

## 未実装（任意・次のエージェント候補）

| 項目 | 優先度 | 備考 |
|------|--------|------|
| `generate-invite-codes` の `.env.local` 自動読み込み | 中 | 毎回 `source` が不要になる |
| localStorage 進捗の Supabase 初回マイグレーション | 低 | ログイン前の `isSolved` をアップロード |
| 管理画面の Week 別クリア数サマリー | 低 | 問題別詳細は実装済み |
| 設定画面にクラウド同期状態の表示 | 低 | |
| PR 作成・マージ・本番デプロイ | **高** | ユーザー依頼があれば実施 |

---

## 主要ファイル一覧

```
src/app/join/page.tsx              # ログイン / ログアウト画面
src/app/admin/page.tsx             # 管理者ダッシュボード
src/components/admin/AdminDashboard.tsx       # 折りたたみサマリーテーブル
src/components/admin/MemberDetailPanel.tsx    # Week 別問題一覧
src/components/admin/ProblemAttemptHistory.tsx # 試行履歴タイムライン
src/app/api/auth/join/route.ts     # 招待コード認証
src/app/api/auth/logout/route.ts   # ログアウト
src/components/layout/AuthNav.tsx  # 左下ナビ
src/components/layout/HintPanel.tsx # ヒント表示・永続化
src/hooks/useMemberAuth.ts         # 認証状態（get_current_member RPC）
src/lib/progress-sync.ts           # 進捗・ヒント記録
src/lib/invite-code.ts             # コードハッシュ化
src/middleware.ts                  # セッション更新 + /admin ガード
src/types/admin.ts                 # 管理画面用型
supabase/migrations/001_initial.sql
supabase/migrations/002_grant_service_role.sql
supabase/migrations/003_grant_authenticated.sql
supabase/migrations/004_admin_problem_detail.sql
docs/SUPABASE_SETUP.md
scripts/generate-invite-codes.mjs
```

---

## 環境変数（`.env.local`、Git 管理外）

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 次のエージェントへの推奨アクション

1. ユーザーに **004 マイグレーション実行**と E2E 確認（問題別詳細・試行履歴・ヒント）を依頼
2. 問題なければ **PR 作成**（`feature/supabase-progress-tracking` → `develop`）
3. 必要なら `.env.local` 自動読み込みや Week 別クリア数サマリーなどの拡張を実装

---

## 関連ドキュメント

- [Supabase セットアップ手順](./SUPABASE_SETUP.md)
