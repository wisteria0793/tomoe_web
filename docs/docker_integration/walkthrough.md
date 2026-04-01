# Docker化 実施内容の確認 (Walkthrough)

フロントエンド（tomoe）とバックエンド（myproject）を一つの Docker 環境で運用するための準備が整いました。

## 実施した変更点

### 1. Dockerfile の作成
- **バックエンド (myproject)**: Python 3.12 イメージを使用。`psycopg2-binary` と `dj-database-url` を追加し、PostgreSQL 接続を可能にしました。
- **フロントエンド (tomoe)**: マルチステージビルドを採用。ビルドステージと、本番用の Nginx ステージ（SSL構成済み）を構築。

### 2. Docker Compose 設定
- **`docker-compose.yml` (ローカル用)**: 
  - フロントエンド: `npm start` によるホットリロード有効。
  - バックエンド: `manage.py runserver` による開発用サーバー。
- **`docker-compose.prod.yml` (本番用)**:
  - **PostgreSQL 16**: データベースを SQLite から Postgres に変更し、ボリュームによる永続化を設定。
  - **Nginx (SSL対応)**: 443番ポートを開放し、HTTP から HTTPS への自動リダイレクトを設定。
  - **Certbot**: SSL 証明書の自動取得・更新のためのサービスを追加。

### 3. 設定ファイルの改善
- **Django (settings.py)**: 
  - `DATABASE_URL` に対応し、PostgreSQL と SQLite を柔軟に切り替え可能。
  - 本番用セキュリティ設定（HSTS, SSLリダイレクト, Cookie 保護など）を自動適用。
- **Nginx (nginx/prod.conf)**: SSL 設定、セキュリティヘッダー、およびバックエンドへのリバースプロキシ設定。


## 使い方

### A. ローカル開発環境の起動
以下のコマンドで、フロントエンドとバックエンドが同時に起動します。
```bash
docker compose up --build
```
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8000

### B. 本番環境（サーバー）での起動
1. `.env.example` をコピーして `.env` を作成し、必要な値を設定します。
2. 以下のコマンドを実行します。
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
- 全体の入り口: http://localhost (80番ポート)

## 検証結果
- 各 Dockerfile の構文にエラーがないことを確認。
- `docker-compose.yml` の構造が正しいことを確認。
- Django の `settings.py` が環境変数を正しく利用するように修正されていることを確認。
