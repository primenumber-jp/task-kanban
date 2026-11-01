# task-kanban

## 概要
タスク管理カンバン。タスクの追加・編集・削除・一覧表示と
ステータス管理（Todo / In Progress / Done）ができる。
Next.js + Supabaseで構築し、Vercelにデプロイする。

## 技術スタック
- Next.js（App Router）
- TypeScript
- Supabase（データベース）
- Vitest + Testing Library（テスト）
- Vercel（デプロイ）

## ディレクトリ構成
```
src/
├── app/                    # ページとレイアウト
│   ├── page.tsx            # トップページ
│   ├── layout.tsx          # 共通レイアウト
│   └── globals.css         # グローバルスタイル
├── lib/supabase/           # Supabase関連
│   ├── env.ts              # 環境変数の読み込み・未設定チェック
│   ├── client.ts           # クライアントコンポーネント用クライアント
│   ├── server.ts           # サーバー用クライアント（cookie対応）
│   └── checkConnection.ts  # 接続確認（/auth/v1/health）
└── instrumentation.ts      # サーバー起動時の処理（Supabase接続確認）
__tests__/                  # テスト
```

## Supabase
- プロジェクト: `task-kanban`（ID: `sjjdbvckbzphtzvvcybl`、リージョン: ap-northeast-1）。詳細はSupabase MCPで確認してください
- パッケージ: `@supabase/supabase-js` と `@supabase/ssr` を使用しています
- 環境変数: キーは `.env.example` を参照し、実際の値は `.env.local` に記載します（`.env*` はgit管理外）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`（`sb_publishable_...` 形式のPublishable key）
- 環境変数は直接 `process.env` から読まず、`getSupabaseEnv()`（`src/lib/supabase/env.ts`）を経由してください
- クライアントの使い分け:
  - Server Component / Route Handler / Server Action: `src/lib/supabase/server.ts` の `createClient()`（async なので `await` が必要）
  - クライアントコンポーネント: `src/lib/supabase/client.ts` の `createClient()`
- 起動時の接続確認: `src/instrumentation.ts` がサーバー起動時に接続を確認し、失敗時のみ `console.error` で `[Supabase] 接続失敗: ...` を出力します（成功時は出力しません）
- テストではSupabaseへの通信（`fetch` など）をモック化し、環境変数は `vi.stubEnv` で設定してください

## 開発コマンド
- npm run dev: 開発サーバー起動（http://localhost:3000）
- npm run build: 本番ビルド
- npm test: Vitestでテスト実行

## コーディングルール
- 変更後は必ず `npm test` でテストが通ることを確認してください
- 変更は1つの関心事に絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約
- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください

## テストルール
- 網羅性: 正常系・異常系・境界値を検討してください
- 可読性: テスト名に条件と期待する結果を明示してください
- 保守性: 実装の内部構造ではなくユーザーから見た振る舞いをテストしてください
- 独立性: テスト間で状態を共有しないでください
- 状態遷移: 画面遷移の順方向・逆方向を検証してください
- モック方針: 外部依存のみモック化してください

## 禁止事項
- console.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を使用しないでください

## MCP活用ルール
- Next.js・Supabase・Vitestなどの最新仕様はContext7 MCPを使って公式ドキュメントを確認してください