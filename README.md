# RFP Response Foundry

## Why（なぜ作るのか）

1件のRFP（提案依頼書）回答業務には平均**25時間**が費やされています。  
部門横断の調整・例外処理・証拠書類管理が属人化し、ミスや遅延が常態化しています。  
**RFP Response Foundry** は、このボトルネックを「ケースボード中心の判断支援システム」で解消します。

---

## Problem（課題）

| 課題 | 詳細 |
|------|------|
| 属人化した調整 | 誰が何をいつ判断したか追跡できない |
| 書類管理の混乱 | Excelや共有フォルダに分散、最新版が不明 |
| 例外処理の迷走 | エスカレーション経路が不明確、対応が遅延 |
| 意思決定の根拠なし | 承認・却下の判断をドキュメント化できない |

---

## Solution（解決策）

```
案件起票 → 受付確認 → 証拠収集 → 審査 → 承認/却下 → クローズ
                                       ↓↑
                                     例外対応
```

- **ケースボード**: 全案件を一覧表示、ステータス・完了率を可視化
- **要件・証拠管理**: 必要書類を定義し、提出状況をリアルタイム追跡
- **判断支援エンジン**: ルールベースで推奨判断・不足事項を自動生成
- **監査証跡**: すべての操作を自動記録、誰がいつ何をしたか完全追跡
- **例外フロー**: 例外理由を記録しながら安全にエスカレーション

---

## How to Use（使い方）

### セットアップ

```bash
git clone https://github.com/your-org/rfp-response-foundry
cd rfp-response-foundry
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 基本的な操作フロー

1. **新規案件** (`/cases/new`) から案件を起票
2. **ケースボード** (`/`) で全案件を確認
3. 案件詳細で証拠書類をアップロード（「証拠を追加」ボタン）
4. 全書類が揃ったら「レビュー開始」でInReviewに移行
5. 判断支援パネルを参考に「承認」または「却下」
6. 完了後「クローズ」

---

## Architecture（アーキテクチャ）

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # ケースボード（一覧）
│   ├── cases/
│   │   ├── new/page.tsx      # 新規案件フォーム
│   │   └── [id]/page.tsx     # 案件詳細・操作
│   └── api/cases/            # REST API
│       ├── route.ts          # GET /api/cases, POST /api/cases
│       └── [id]/
│           ├── route.ts      # GET/PATCH /api/cases/:id
│           ├── evidence/     # POST /api/cases/:id/evidence
│           └── decision/     # POST /api/cases/:id/decision
├── lib/
│   ├── types.ts              # 型定義（RfpCase, Requirement, Evidence...）
│   ├── store.ts              # インメモリストア（グローバルシングルトン）
│   └── rules.ts             # 判断支援ルールエンジン
└── components/
    ├── StatusBadge.tsx       # ステータスバッジ
    ├── CaseCard.tsx          # ケースカード
    └── AuditTrail.tsx        # 監査証跡タイムライン
```

### 技術スタック

| 項目 | 技術 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | React useState / useEffect |
| Storage | In-memory (module singleton) |
| Runtime | Node.js 20+ |

---

## Screenshots

### ケースボード（一覧画面）

![ケースボード](https://github.com/user-attachments/assets/c7497dd6-b451-40fa-8bf0-816a7ccc7259)

全案件のステータス・証拠完了率・担当者を一目で把握できます。

### 案件詳細画面

![案件詳細](https://github.com/user-attachments/assets/cf6d76cf-cdd1-4cac-902e-3be915f1d3c2)

要件チェックリスト・判断支援パネル・監査証跡を1画面で確認し、承認・却下・例外昇格をワンクリックで操作できます。

---

## Development

```bash
npm run dev      # 開発サーバー起動（http://localhost:3000）
npm run build    # プロダクションビルド
npm run lint     # リント実行
```

---

## Notes

- 現在はインメモリストアのため、**サーバー再起動でデータはリセット**されます
- 本番運用にはデータベース（PostgreSQL, SQLite等）への移行を推奨します
- シードデータとして3件のサンプル案件が初期状態で含まれています
