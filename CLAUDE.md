# 営業日報システム

## プロジェクト概要

営業担当者が日々の顧客訪問内容を報告し、上長がコメント・フィードバックを行うためのWebシステム。

## 使用技術

- 言語: TypeScript
- フレームワーク: Next.js (App Router)
- UI: shadcn/ui + Tailwind CSS
- DB/ORM: Prisma (SQLite)
- バリデーション: Zod
- テスト: Vitest

## 設計ドキュメント

以下のドキュメントを参照してください：

@doc/requirements.md
@doc/er-diagram.md
@doc/screen-definition.md
@doc/api-specification.md

## 開発ルール

### コーディング規約

- コードは読みやすく、シンプルに保つ
- 命名は明確で一貫性を持たせる
- 過度な抽象化を避ける

### テストコード

- テストは実際の機能を検証すること
- `expect(true).toBe(true)` のような意味のないアサーションは禁止
- ハードコーディングでテストを通すことは禁止
- 境界値、異常系、エラーケースもテストすること

### Git

- コミットメッセージは日本語で、変更内容を簡潔に記述
- 機能単位でコミットする
