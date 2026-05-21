# DB設計

## テーブル一覧

| テーブル | 用途 |
|---|---|
| users | ユーザー（拡張カラムあり） |
| accounts | next-auth OAuthアカウント情報 |
| sessions | next-auth セッション |
| verification_tokens | next-auth メール認証トークン |
| courses | 講座 |
| sections | セクション（章） |
| videos | 動画 |
| course_passwords | 単発講座用パスワード |
| subscription_passwords | サブスク用パスワード |
| course_access | ユーザーの講座アクセス権 |

---

## テーブル定義

### users
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | ユーザーID |
| name | text | 表示名 |
| email | text UNIQUE | メールアドレス |
| emailVerified | integer | メール認証日時 |
| image | text | アバター画像URL |
| role | text | `admin` / `member` |
| membership_type | text | `none` / `single` / `subscription` |
| created_at | integer | 作成日時 |

### courses
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | 講座ID |
| title | text | 講座名 |
| description | text | 説明 |
| thumbnail | text | サムネイルURL |
| access_type | text | `single` / `subscription` |
| published | integer | 公開フラグ（0/1） |
| order | integer | 表示順 |
| created_at | integer | 作成日時 |
| updated_at | integer | 更新日時 |

### sections
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | セクションID |
| course_id | text FK→courses | 講座ID |
| title | text | セクション名 |
| order | integer | 表示順 |
| created_at | integer | 作成日時 |

### videos
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | 動画ID |
| section_id | text FK→sections | セクションID |
| title | text | 動画タイトル |
| youtube_id | text | YouTube動画ID |
| description | text | 動画説明 |
| duration | text | 再生時間（例: 10:30） |
| order | integer | 表示順 |
| created_at | integer | 作成日時 |

### course_passwords
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | パスワードID |
| course_id | text FK→courses | 対象講座ID |
| password | text | パスワード文字列 |
| used_by_email | text NULL | 使用したメールアドレス（null=未使用） |
| used_at | integer NULL | 使用日時 |
| created_at | integer | 作成日時 |

### subscription_passwords
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | パスワードID |
| password | text | パスワード文字列 |
| used_by_email | text NULL | 使用したメールアドレス（null=未使用） |
| used_at | integer NULL | 使用日時 |
| created_at | integer | 作成日時 |

### course_access
| カラム | 型 | 説明 |
|---|---|---|
| id | text PK | アクセス権ID |
| user_id | text FK→users | ユーザーID |
| course_id | text FK→courses | 講座ID |
| granted_at | integer | 付与日時 |

---

## ER図（簡略）

```
users ──────────────────── course_access ── courses
  │                                              │
  │                                          sections
  │                                              │
  └── (email照合)                             videos
          │
   course_passwords ──── courses
   subscription_passwords
```

---

## パスワード解放ロジック

### 単発講座
```
1. course_passwords から (course_id, password) を検索
2. 見つからない → エラー「パスワードが正しくありません」
3. used_by_email が自分のメール → course_access に追加（冪等）
4. used_by_email が他人のメール → エラー「既に使用済み」
5. used_by_email が NULL → used_by_email を自分のメールで更新 + course_access に追加
```

### サブスク
```
1. subscription_passwords から password を検索
2. 見つからない → エラー
3. used_by_email が自分のメール → users.membership_type を subscription に更新（冪等）
4. used_by_email が他人のメール → エラー「既に使用済み」
5. used_by_email が NULL → used_by_email を更新 + users.membership_type を subscription に更新
```
