# 営業日報システム API仕様書

## 1. 概要

- ベースURL: `/api/v1`
- 認証: Bearer Token (JWT)
- レスポンス形式: JSON

## 2. 共通仕様

### リクエストヘッダー

```
Content-Type: application/json
Authorization: Bearer <token>
```

### 共通レスポンス形式

**成功時:**
```json
{
  "success": true,
  "data": { ... }
}
```

**エラー時:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエスト不正 |
| 401 | 認証エラー |
| 403 | 権限エラー |
| 404 | リソース未検出 |
| 500 | サーバーエラー |

---

## 3. 認証 API

### POST /api/v1/auth/login

ログイン

**リクエスト:**
```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "山田太郎",
      "email": "yamada@example.com",
      "role": "sales",
      "department": {
        "id": 1,
        "name": "営業1課"
      }
    }
  }
}
```

### POST /api/v1/auth/logout

ログアウト

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "ログアウトしました"
  }
}
```

### GET /api/v1/auth/me

現在のユーザー情報取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "sales",
    "department": {
      "id": 1,
      "name": "営業1課"
    },
    "manager": {
      "id": 2,
      "name": "鈴木部長"
    }
  }
}
```

---

## 4. 日報 API

### GET /api/v1/reports

日報一覧取得

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| start_date | date | | 検索開始日（YYYY-MM-DD） |
| end_date | date | | 検索終了日（YYYY-MM-DD） |
| user_id | int | | ユーザーID（上長のみ指定可） |
| status | string | | draft / submitted |
| page | int | | ページ番号（デフォルト: 1） |
| limit | int | | 取得件数（デフォルト: 20） |

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "report_date": "2026-02-03",
        "status": "submitted",
        "submitted_at": "2026-02-03T18:00:00Z",
        "user": {
          "id": 1,
          "name": "山田太郎"
        },
        "visit_count": 3,
        "comment_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 100
    }
  }
}
```

### GET /api/v1/reports/:id

日報詳細取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "report_date": "2026-02-03",
    "status": "submitted",
    "submitted_at": "2026-02-03T18:00:00Z",
    "user": {
      "id": 1,
      "name": "山田太郎"
    },
    "visit_records": [
      {
        "id": 1,
        "visit_datetime": "2026-02-03T10:00:00Z",
        "customer": {
          "id": 1,
          "name": "株式会社ABC"
        },
        "purpose": "定期訪問",
        "content": "新製品の提案を行った。担当者の反応は良好。",
        "problem": "予算確保が課題。来期予算での検討となる見込み。",
        "plan": "来月に再度訪問し、来期予算申請のサポートを行う。",
        "display_order": 1
      }
    ],
    "comments": [
      {
        "id": 1,
        "content": "良い提案ができていますね。",
        "user": {
          "id": 2,
          "name": "鈴木部長"
        },
        "created_at": "2026-02-03T15:30:00Z"
      }
    ],
    "created_at": "2026-02-03T17:00:00Z",
    "updated_at": "2026-02-03T18:00:00Z"
  }
}
```

### POST /api/v1/reports

日報作成

**リクエスト:**
```json
{
  "report_date": "2026-02-03",
  "status": "draft",
  "visit_records": [
    {
      "visit_datetime": "2026-02-03T10:00:00Z",
      "customer_id": 1,
      "purpose": "定期訪問",
      "content": "新製品の提案を行った。",
      "problem": "予算確保が課題。",
      "plan": "来月に再度訪問する。",
      "display_order": 1
    }
  ]
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "report_date": "2026-02-03",
    "status": "draft",
    "created_at": "2026-02-03T17:00:00Z"
  }
}
```

### PUT /api/v1/reports/:id

日報更新

**リクエスト:**
```json
{
  "status": "submitted",
  "visit_records": [
    {
      "id": 1,
      "visit_datetime": "2026-02-03T10:00:00Z",
      "customer_id": 1,
      "purpose": "定期訪問",
      "content": "新製品の提案を行った。担当者の反応は良好。",
      "problem": "予算確保が課題。来期予算での検討となる見込み。",
      "plan": "来月に再度訪問し、来期予算申請のサポートを行う。",
      "display_order": 1
    }
  ]
}
```

### DELETE /api/v1/reports/:id

日報削除（下書きのみ削除可能）

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "message": "日報を削除しました"
  }
}
```

---

## 5. コメント API

### POST /api/v1/reports/:report_id/comments

コメント追加

**リクエスト:**
```json
{
  "content": "良い提案ができていますね。サポートします。"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "良い提案ができていますね。サポートします。",
    "user": {
      "id": 2,
      "name": "鈴木部長"
    },
    "created_at": "2026-02-03T15:30:00Z"
  }
}
```

### DELETE /api/v1/reports/:report_id/comments/:id

コメント削除（投稿者本人のみ）

---

## 6. 顧客 API

### GET /api/v1/customers

顧客一覧取得

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| keyword | string | | 検索キーワード |
| page | int | | ページ番号 |
| limit | int | | 取得件数 |

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "name": "株式会社ABC",
        "address": "東京都千代田区...",
        "phone": "03-1234-5678",
        "contact_person": "田中一郎",
        "email": "tanaka@abc.co.jp",
        "is_active": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 50
    }
  }
}
```

### GET /api/v1/customers/:id

顧客詳細取得

### POST /api/v1/customers

顧客作成

**リクエスト:**
```json
{
  "name": "株式会社ABC",
  "address": "東京都千代田区...",
  "phone": "03-1234-5678",
  "contact_person": "田中一郎",
  "email": "tanaka@abc.co.jp",
  "notes": "大口顧客"
}
```

### PUT /api/v1/customers/:id

顧客更新

### DELETE /api/v1/customers/:id

顧客削除（論理削除: is_active = false）

---

## 7. ユーザー API

### GET /api/v1/users

ユーザー一覧取得（管理者のみ）

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|------------|-----|------|------|
| department_id | int | | 部署ID |
| role | string | | sales / manager / admin |
| page | int | | ページ番号 |
| limit | int | | 取得件数 |

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "山田太郎",
        "email": "yamada@example.com",
        "department": {
          "id": 1,
          "name": "営業1課"
        },
        "role": "sales",
        "manager": {
          "id": 2,
          "name": "鈴木部長"
        },
        "is_active": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_count": 30
    }
  }
}
```

### GET /api/v1/users/:id

ユーザー詳細取得（管理者のみ）

### POST /api/v1/users

ユーザー作成（管理者のみ）

**リクエスト:**
```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "password": "password123",
  "department_id": 1,
  "role": "sales",
  "manager_id": 2
}
```

### PUT /api/v1/users/:id

ユーザー更新（管理者のみ）

### DELETE /api/v1/users/:id

ユーザー削除（論理削除: is_active = false）（管理者のみ）

---

## 8. 部署 API

### GET /api/v1/departments

部署一覧取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "営業1課"
      },
      {
        "id": 2,
        "name": "営業2課"
      }
    ]
  }
}
```

### POST /api/v1/departments

部署作成（管理者のみ）

### PUT /api/v1/departments/:id

部署更新（管理者のみ）

### DELETE /api/v1/departments/:id

部署削除（管理者のみ）

---

## 9. ダッシュボード API

### GET /api/v1/dashboard

ダッシュボード情報取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "monthly_summary": {
      "submitted_count": 15,
      "draft_count": 2
    },
    "recent_reports": [
      {
        "id": 1,
        "report_date": "2026-02-03",
        "status": "submitted",
        "visit_count": 3
      }
    ],
    "unread_comments": {
      "count": 3,
      "comments": [
        {
          "id": 1,
          "report_id": 1,
          "report_date": "2026-02-03",
          "content": "良い提案ができていますね。",
          "user": {
            "id": 2,
            "name": "鈴木部長"
          },
          "created_at": "2026-02-03T15:30:00Z"
        }
      ]
    }
  }
}
```
