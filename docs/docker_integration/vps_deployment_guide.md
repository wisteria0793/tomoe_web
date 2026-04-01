# Xserver VPS デプロイガイド (Docker 統合)

現在、`tomoe` と `myproject` を分離して運用している環境から、今回構築した Docker 統合環境へ VPS 上で移行する手順をご案内します。

## 1. Git を利用したデプロイフロー

Git（GitHub などの非公開リポジトリ推奨）を利用することで、ローカルでの修正内容を安全かつ迅速に VPS へ反映できます。

### おすすめのフロー:
1.  **ローカルでの開発・デバッグ**:
    - コード修正後、`docker compose up --build` で動作確認。
2.  **Git へプッシュ**:
    - `git add .`, `git commit`, `git push` を実行。
3.  **VPS での更新反映**:
    - VPS に SSH で接続し、プロジェクトディレクトリで `git pull` を実行。
    - `docker compose -f docker-compose.prod.yml up -d --build` でコンテナをリビルド・再起動。

## 2. VPS での初期セットアップ手順

既存の分離された環境から、統合環境へ移行する際の具体的なステップです。

### ステップ 1: プロジェクトのクローン
```bash
# 修正済みの統合プロジェクトをクローン (または既存ディレクトリで git fetch)
git clone <your-repository-url> tomoe_integrated
cd tomoe_integrated
```

### ステップ 2: 環境変数 (.env) の設定
`.env.example` を参考に、VPS 上で本番用の設定を入力した `.env` ファイルを作成します。
```bash
cp .env.example .env
nano .env  # 実際のドメイン名、パスワード、秘密鍵、Stripe APIキーなどを入力
```
**重要事項**:
- `DJANGO_ALLOWED_HOSTS` には、VPS のドメイン名（例: `hakodate-tomoe.com`）や IP アドレスを正確に記述してください。

### ステップ 3: 起動と公開
本番環境専用の設定ファイルを使用して起動します。
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
このコマンドにより：
- **フロントエンド (Nginx)**: ポート 80 (HTTP) と 443 (HTTPS) で公開されます（Certbot 連携設定済み）。
- **バックエンド (Django)**: 内部ネットワークで安全に動作し、Gunicorn で実行されます。
- **データベース (PostgreSQL)**: 独立したボリュームにデータを保存する形で起動します。

## 3. データの移行に関する注意点

- **PostgreSQL への移行**: 
  バックエンドを SQLite から PostgreSQL に切り替えた場合、既存データの移行が必要です。
  - 既存環境(SQLite): `python manage.py dumpdata > data.json`
  - 新環境(Postgres): `docker compose exec backend python manage.py loaddata data.json`
  ※ 移行前に外部キーの制約などでエラーが出る場合があるため、慎重に行ってください。

- **SSL 証明書の取得**:
  ドメインの A レコードが VPS を向いた状態で、Certbot を利用して SSL 証明書を生成する必要があります。初期設定については、作成済みの `docker-compose.prod.yml` 内のコメントをご確認ください。

---
Git を利用した運用に切り替えることで、手動でのファイル転送 (FTP等) の手間が省け、ミスの少ない安定した運用が可能になります。
現在 Git を利用されていない場合、まずは GitHub 等でプライベートリポジトリを作成することをお勧めします。
