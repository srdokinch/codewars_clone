# Supabase セットアップ手順

このドキュメントは、進捗共有機能を動かすための Supabase 側の作業手順です。

## 1. プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. **New Project** をクリック
3. プロジェクト名・データベースパスワード・リージョンを設定して作成

## 2. Security 設定（推奨）

Dashboard の **Settings** → **API**（または Security セクション）で以下を設定してください。

| 設定 | 推奨 | 理由 |
|------|------|------|
| **Enable Data API** | ON | ブラウザから `supabase-js` で認証・進捗記録に必要 |
| **Automatically expose new tables** | OFF | 新テーブルを自動公開せず、SQL で権限を手動管理 |
| **Enable automatic RLS** | ON | 新テーブルに RLS を自動付与（設定忘れの防止） |

## 3. API キーの取得

| 環境変数 | Dashboard での場所 |
|----------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Integrations → Data API** の API URL、または `https://<Reference ID>.supabase.co`（Reference ID は **Settings → General**） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Settings → API Keys** の anon / publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | **Settings → API Keys** の service_role / secret（**Reveal** で表示。Git にコミットしない） |

旧 UI では **Settings → API** にまとまって表示されていました。

## 4. 環境変数の設定

リポジトリルートの `.env.local` に、控えた値を記入します（`.gitignore` 済みで Git には入りません）。

```bash
cp .env.example .env.local   # まだ無い場合
```

`.env.local` の例:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

記入後、開発サーバーを起動する場合は **一度止めて `npm run dev` を再実行**してください。

## 5. データベースマイグレーションの実行

1. Supabase Dashboard の **SQL Editor** を開く
2. [`supabase/migrations/001_initial.sql`](../supabase/migrations/001_initial.sql) の内容をすべてコピー
3. **Run** で実行

`001_initial.sql` 実行後、続けて [`supabase/migrations/002_grant_service_role.sql`](../supabase/migrations/002_grant_service_role.sql) と [`supabase/migrations/003_grant_authenticated.sql`](../supabase/migrations/003_grant_authenticated.sql) も実行してください。

エラーなく完了すれば、テーブル・RLS・RPC が作成される。

作成される主なオブジェクト:

- `members` — 表示名・ロール
- `invite_codes` — 招待コードのハッシュ（クライアントからはアクセス不可）
- `member_credentials` — 認証用（Service Role のみ）
- `problem_attempts` / `problem_progress` — 進捗・正誤率
- `record_problem_attempt` — 進捗記録 RPC
- `get_admin_dashboard` — 管理者ダッシュボード RPC

## 6. Auth 設定

招待コード方式のため、通常のメールサインアップは使いません。

1. **Authentication** → **Providers** → **Email**
2. **Enable Email Signup** をオフにしてもよい（任意）
3. ユーザーは Admin API（`/api/auth/join`）経由で作成されます

## 7. 招待コードの発行

マイグレーション完了後、ローカルで以下を実行:

```bash
# メンバー用コードを 5 件発行
npm run generate-invite-codes -- --count 5

# 管理者用コードを 1 件発行
npm run generate-invite-codes -- --count 1 --role admin
```

表示された平文コードを、社内の安全な経路でメンバーに配布する。  
誰がどのコードかの対応表は、スプレッドシート等で社外（DB 外）管理する。

## 8. 動作確認

```bash
npm run dev
```

1. http://localhost:3000/join で招待コードを入力
2. 初回は表示名を設定
3. 問題を実行すると進捗が Supabase に記録される
4. 管理者コードでログイン後、http://localhost:3000/admin で全員の進捗を確認

## 9. 退職者のコード無効化

SQL Editor で実行:

```sql
UPDATE invite_codes
SET is_active = false
WHERE member_id = '対象メンバーの UUID';
```

## トラブルシューティング

| 症状 | 確認事項 |
|------|----------|
| ログインできない | `.env.local` の URL / キーが正しいか。マイグレーションが実行済みか |
| 進捗が記録されない | ログイン済みか。ブラウザのコンソールに RPC エラーがないか |
| 管理画面に入れない | `--role admin` で発行したコードでログインしたか |
| 招待コード生成が失敗 | `SUPABASE_SERVICE_ROLE_KEY` が正しいか |
| クライアントからデータが取れない | **Enable Data API** が ON か |
