# JS Dojo - JavaScript学習サイト

HTML/CSSコーダー向けの社内JavaScript基礎学習サイトです。Codewars風の問題形式で、Week1〜Week12のカリキュラムを学べます。

## 技術スタック

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- JSON（問題データ管理、DB不要）

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 で起動します。

## プロジェクト構成

```
src/
├── app/                    # ページ（App Router）
│   ├── page.tsx            # ホーム（Week一覧）
│   └── week/[weekId]/      # Week詳細・問題画面
├── components/
│   ├── CodeRunner/         # コード実行・判定ロジック
│   ├── editor/             # コードエディタ
│   └── layout/             # サイドバー・ヒントパネル
├── data/
│   ├── weeks.json          # Weekメタデータ（Week1-12）
│   └── problems/           # 問題データ（week1.json 〜）
├── lib/
│   └── problems.ts         # データ取得ユーティリティ
└── types/
    └── index.ts            # 型定義
```

## 問題データの追加方法

### 新しいWeekの問題を追加

1. `src/data/problems/week5.json` を作成
2. `src/lib/problems.ts` の `problemsByWeek` にインポートを追加

```typescript
import week5Problems from "@/data/problems/week5.json";

const problemsByWeek: Record<number, Problem[]> = {
  // ...
  5: week5Problems as Problem[],
};
```

### 問題データ形式

```json
{
  "id": "w5-b1",
  "week": 5,
  "title": "問題タイトル",
  "level": "basic",
  "type": "test",
  "functionName": "add",
  "question": "問題文",
  "starterCode": "function add(a, b) {\n  \n}",
  "answer": "模範回答",
  "explanation": "解説",
  "learningPoints": ["ポイント1", "ポイント2"],
  "hints": ["ヒント1", "ヒント2"],
  "testCases": [
    { "input": [10, 20], "expected": 30 }
  ]
}
```

### 判定方式

| Week | type | 説明 |
|------|------|------|
| 1-4 | `execution` | `console.log` の出力を期待値と比較 |
| 5以降 | `test` | 関数をテストケースで検証（`functionName` 必須） |

### 判定ロジックの拡張

`src/components/CodeRunner/runner.ts` の `registerRunnerStrategy()` で新しい判定方式を登録できます。

## ライセンス

社内学習用
