# task-kanban

## 概要
タスク管理カンバン。タスクの追加・編集・削除・一覧表示と
ステータス管理（Todo / In Progress / Done）ができる。
Next.js + Supabaseで構築し、Vercelにデプロイする。

## 技術スタック
- Next.js（App Router）
- TypeScript
- Supabase（データベース）
- Tailwind CSS v4 + shadcn/ui（Base UI ベース、style: `base-nova`）
- Vitest + Testing Library + user-event（テスト）
- Vercel（デプロイ）

## Next.js 16 の注意点
- 学習データと仕様が異なる可能性があります。実装前に `node_modules/next/dist/docs/` の該当ガイドを確認してください（AGENTS.md参照）
- `next.config.ts` で `cacheComponents` が有効です。Server Componentで `cookies()` などのランタイムAPIやキャッシュしないデータ取得を行う場合は `<Suspense>` で囲む必要があります
- サーバー起動時の処理は `src/instrumentation.ts` の `register()` に書きます

## ディレクトリ構成
```
src/
├── app/                    # ページとレイアウト
│   ├── page.tsx            # トップページ
│   ├── layout.tsx          # 共通レイアウト
│   └── globals.css         # グローバルスタイル
├── components/             # UIコンポーネント
│   ├── TaskBoard.tsx       # カンバン本体（取得・追加・編集・削除とstate管理）
│   ├── TaskCard.tsx        # タスクカード（表示/編集切替、削除確認）
│   ├── TaskForm.tsx        # 追加・編集共用フォーム
│   └── ui/                 # shadcn/uiのコンポーネント（CLIで追加）
├── lib/utils.ts            # `cn`（クラス名結合）の再エクスポート
├── lib/supabase/           # Supabase関連
│   ├── env.ts              # 環境変数の読み込み・未設定チェック
│   ├── client.ts           # クライアントコンポーネント用クライアント
│   ├── server.ts           # サーバー用クライアント（cookie対応）
│   ├── database.types.ts   # Supabase MCPで生成したDB型（手で編集しない）
│   └── checkConnection.ts  # 接続確認（/auth/v1/health）
├── lib/tasks/
│   ├── types.ts            # Task型・ステータス定義・タイトルのバリデーション
│   └── taskApi.ts          # tasksテーブルのCRUD
└── instrumentation.ts      # サーバー起動時の処理（Supabase接続確認）
__tests__/                  # テスト
└── helpers/fakeSupabase.ts # テスト用のインメモリSupabase
```

## shadcn/ui
- 設定は `components.json`（style: `base-nova`、ベースカラー: neutral、アイコン: lucide、CSS変数でテーマ管理）
- コンポーネントの追加は `npx shadcn@latest add <名前>` で行い、`src/components/ui/` に生成されます。手順やAPIはContext7 MCPで最新ドキュメントを確認してください
- プリミティブは Radix UI ではなく Base UI（`@base-ui/react`）です。ドキュメントやサンプルは Base UI 版を参照してください
- `cn` は npm パッケージ `cn` から提供され、`src/lib/utils.ts` で再エクスポートしています
- Tailwind は PostCSS ではなく `next.config.ts` の Turbopack ローダー（`@tailwindcss/turbopack`）で読み込んでいます。`postcss.config.*` は作らないでください
- テーマの色・角丸は `src/app/globals.css` の CSS変数（`:root` / `.dark`）で管理しています。色は `bg-primary` や `text-muted-foreground` などのテーマトークンを使ってください
- フォントは `layout.tsx` の Geist（`--font-geist-sans`）を `--font-sans` に割り当てています。`shadcn init` や `add` が `globals.css` を書き換えた場合は、`--font-sans: var(--font-sans)` のような自己参照になっていないか確認してください
- ダークモードは `.dark` クラス方式（`@custom-variant dark`）です。切り替えの仕組みは未実装のため、現状はOSがダークでもライト表示になります
- 導入済みのコンポーネント: button / card / input / textarea / label / native-select / badge / alert

## デザインルール
`TaskBoard` / `TaskCard` / `TaskForm` / `page.tsx` は shadcn/ui で構成しています。UIを追加・変更する際は以下に従ってください。

### 基本方針
- UI部品はまず `src/components/ui/` の shadcn/ui コンポーネントを使い、素の `<button>` / `<input>` などに Tailwind を直接書かないでください。必要な部品がなければ `npx shadcn@latest add` で追加します
- `src/components/ui/` の生成ファイルは原則編集せず、見た目の調整は使う側の `className` で行ってください
- 色はテーマトークン（`bg-card`・`bg-muted`・`text-muted-foreground`・`text-destructive`・`ring-foreground/10` など）のみ使い、`zinc-*`・`red-*` などのパレット色や16進カラーを直接書かないでください
- 配色はneutralのモノトーンを基調にしています。ステータスは色ではなくアイコンで区別します（Todo: `Circle`、In Progress: `CircleDashed`、Done: `CircleCheck`。`TaskBoard.tsx` の `statusIcons`）
- アイコンは `lucide-react` を使い、装飾目的のアイコンには `aria-hidden="true"` を付けてください。ボタンはアイコンだけにせず、テキストも並べます（例: `<Pencil />編集`）

### レイアウト
- ページは `max-w-7xl` の中央寄せ、背景は `body` の `bg-muted/30`、カードやフォームは `bg-card` で一段明るく見せます
- `lg` 以上は「左に追加フォーム（`18rem`、`sticky`）＋右に3列」、`md` は「フォームを上に置き、その下に3列」、それより狭い画面は1列です。スマホ幅（390px程度）でも崩れないようにしてください
- 列は `rounded-xl bg-muted/60 p-3` の `section` で、ヘッダーはステータスアイコン・`h2`・件数の `Badge` の順に並べます
- 空状態は破線の枠（`border-dashed`）＋ `text-muted-foreground` で表示します

### コンポーネントの使い分け
| 用途 | 使うもの |
|---|---|
| タスクカード・追加フォームの枠 | `Card`（カードは `size="sm"`、編集中は `ring-2 ring-ring/40` で強調） |
| 主要な操作（追加・保存） | `Button`（`variant="default"`） |
| 補助的な操作（編集・キャンセル） | `Button`（`variant="ghost"`、カード内は `size="sm"`） |
| 危険な操作（削除） | `ghost` ＋ `text-muted-foreground hover:bg-destructive/10 hover:text-destructive`（普段は控えめにし、ホバーで赤くする） |
| 入力欄 | `Label` ＋ `Input` / `Textarea`。ラベルと入力欄は `flex flex-col gap-2` でまとめ、フィールド同士は `gap-4` |
| ステータスの選択 | `NativeSelect`（テストの `user.selectOptions` がネイティブの `<select>` を前提にしているため、Base UI の `Select` は使わない） |
| 件数 | `Badge`（`variant="secondary"`、`tabular-nums`） |
| 通信エラー | `Alert variant="destructive"` ＋ `CircleAlert` アイコン ＋ `AlertDescription`（`AlertTitle` は付けない） |
| 入力のエラー | 入力欄の直下に `<p role="alert" className="text-xs text-destructive">`、入力欄に `aria-invalid` と `aria-describedby` |
| 読み込み中 | `Loader2`（`animate-spin`）＋「読み込み中...」 |

### 実装上の注意（テストとの関係）
- テストが使っている role・アクセシブルネーム（`article`・`region`・`form` の名前、ボタン名、ラベル名、表示文言）を変えないでください
- shadcn/ui の `Card` は `div` を描画するため、タスクカードは `<article aria-label={タイトル}>` で `Card` を包んでいます
- 列の名前は `h2` から付く（`aria-labelledby`）ため、件数の `Badge` など他の要素は `h2` の外に置いてください（中に入れると名前が「Todo 1」のようになります）
- テストは `role="alert"` の `textContent` をメッセージと完全一致で比較しています。`Alert` にはテキストを持つ要素を追加しないでください
- Base UI の `Button` は既定で `type="button"` になります。送信ボタンには `type="submit"` を明示してください
- 削除確認はブラウザ標準の `window.confirm` を使います（`AlertDialog` には置き換えていません）
- 画面のデザインを変えたら、Playwright MCP で PC幅とスマホ幅のスクリーンショットを撮って確認してください

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

### tasksテーブル
| カラム | 型 | 制約 |
|---|---|---|
| id | uuid | 主キー、`gen_random_uuid()` |
| title | text | 必須、前後空白を除いて1〜100文字 |
| description | text | 必須（既定値 `''`）、500文字以内 |
| status | text | `todo` / `in_progress` / `done`（既定値 `todo`） |
| created_at | timestamptz | 既定値 `now()` |
| updated_at | timestamptz | 更新時にトリガー `set_updated_at` で自動更新 |

- RLS: 有効。認証が未実装のため、anonロールに全操作（select/insert/update/delete）を許可しています。認証を導入する際はポリシーを見直してください
- スキーマ変更はSupabase MCPの `apply_migration` で行い、その後 `generate_typescript_types` で `database.types.ts` を再生成し、`get_advisors` で警告を確認してください
- バリデーションの上限値はDBの制約と `src/lib/tasks/types.ts` で揃えてください
- マイグレーション履歴はSupabase側にのみあります（ローカルに `supabase/migrations` はありません）。履歴は `list_migrations` で確認してください
- 実データでの動作確認は `execute_sql` で行い、確認用に作ったデータは最後に削除してください

### スキーマ変更時に合わせて直す箇所
- カラム追加・変更: マイグレーション → `database.types.ts` 再生成 → `src/lib/tasks/types.ts`（`Task`・`TaskInput`）→ `taskApi.ts` → `TaskForm` → `fakeSupabase.ts`（`insert` の既定値）→ テスト
- ステータス追加: DBの `status` のcheck制約 → `taskStatuses` と `taskStatusLabels`（列とセレクトの選択肢はここから自動生成されます）→ テスト
- DBの `status` は型上 `string` のため、`taskApi.ts` の `toTask()` で `TaskStatus` に変換しています（未知の値は `todo` 扱い）

### タスク機能の実装方針
- データの取得・更新はクライアントコンポーネント（`TaskBoard`）から `src/lib/tasks/taskApi.ts` を通して行い、成功したらstateを直接更新して一覧にすぐ反映します
- 失敗時は `role="alert"` でエラーメッセージを表示し、一覧は変更しません
- 削除前に `window.confirm` で確認します
- 処理中はボタンを `disabled` にして二重送信を防ぎます
- タイトルは保存前に `trim()` し、文字数はコードポイント単位（`[...str].length`）で数えます。DBの `btrim` は半角スペースしか除去しないため、空白の扱いはアプリ側で揃えてください
- エラーメッセージ・ボタン名・ラベルは日本語、ステータス名は英語（Todo / In Progress / Done）です。テストはこれらの文言でUIを取得しているため、変更時はテストも更新してください

### 未実装・既知の制約
- 認証（ユーザーごとのタスク分離）
- ダークモードの切り替え（shadcn/ui の `.dark` クラス方式に対応する仕組みがありません）
- ドラッグ&ドロップでのステータス変更、列内の並び替え（現在は作成日時の昇順）
- リアルタイム同期（他のタブ・端末での変更は再読み込みするまで反映されません）

### テスト方法
- `@supabase/ssr` を `vi.mock` し、`createBrowserClient` が `__tests__/helpers/fakeSupabase.ts` の `createFakeSupabase(rows).client` を返すようにします
- `fake.failOn.add('insert')` などでDBエラーを再現でき、`fake.calls` でリクエストの有無を確認できます
- `window.confirm` は `vi.spyOn(window, 'confirm')` で差し替えます
- 操作は `@testing-library/user-event` で行い、列は `getByRole('region', { name: 'Todo' })`、カードは `getByRole('article', { name: タイトル })`、追加フォームは `getByRole('form', { name: 'タスクを追加' })` で取得します
- `taskApi.ts` で新しいクエリメソッド（`.eq` 以外のフィルタなど）を使う場合は `fakeSupabase.ts` にも同じチェーンを追加してください
- `@/app/page` を描画するテストも `TaskBoard` がSupabaseを呼ぶため、`@supabase/ssr` のモックが必要です

## 開発コマンド
- npm run dev: 開発サーバー起動（http://localhost:3000）
- npm run build: 本番ビルド
- npm test: Vitestでテスト実行（ウォッチモード）
- npm run test:run: Vitestで1回だけテスト実行（確認・CI向け）
- npx tsc --noEmit: 型チェック
- npm run lint: ESLint
- 開発サーバーが既に起動している場合、2つ目の `next dev` は起動を拒否します。既存のサーバー（http://localhost:3000）を使い、ログは `.next/dev/logs/next-development.log` で確認してください

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