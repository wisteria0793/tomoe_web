# 本番環境高度化 (PostgreSQL & SSL) の実装計画

前回の Docker 基本構成に加え、本番運用に耐えうる「PostgreSQL 移行」と「SSL 守備範囲の拡大」を実施します。

## ユーザーレビューが必要な項目
> [!WARNING]
> - PostgreSQL への移行に伴い、SQLite のデータを移行する場合は `dumpdata` と `loaddata` を使用する手順が必要になります。
> - SSL 証明書は `Certbot` を使用する想定ですが、初回起動時にドメインの所有権確認が必要です。

## 提案される変更点

### データベース (PostgreSQL)
- [MODIFY] `docker-compose.prod.yml`: `db` (Postgres 16) サービスを追加
- [MODIFY] `myproject/guesthouse_tomoe/guesthouse_tomoe/settings.py`: 環境変数 `DATABASE_URL` があれば Postgres、なければ SQLite を使うように修正（互換性確保）

### Nginx & SSL
- [MODIFY] `nginx/prod.conf`: HTTP (80) から HTTPS (443) へのリダイレクト、および SSL 証明書のパス設定を追加
- [MODIFY] `docker-compose.prod.yml`: `certbot` サービスの追加検討、またはボリュームマウント設定

### セキュリティ強化
- [MODIFY] `settings.py`: `SECURE_BROWSER_XSS_FILTER`, `SECURE_CONTENT_TYPE_NOSNIFF`, `SECURE_SSL_REDIRECT` などの追加

## 検証プラン

### 自動テスト
- `docker compose -f docker-compose.prod.yml config` で設定の妥当性を確認。

### 手動確認
- `db` コンテナが正常に起動し、Django が接続できることを確認。
- SSL 設定済みの Nginx が 443 番ポートで待機していることを確認。
