# GitHub Actions を利用した CI/CD (自動デプロイ) ガイド

GitHub Actions を利用して、エンジニアがコードを `main` ブランチに `push` するだけで、自動的に VPS へデプロイする仕組みを構築しました。

## 1. ワークフローファイルの構成

作成済みの [deploy.yml](file:///Users/atsuyakatougi/Desktop/tomoe_web/.github/workflows/deploy.yml) は、以下の処理を自動で実行します。

1.  **最新コードの取得**: GitHub から VPS 側へ `git pull` を実行。
2.  **Docker 再起動**: `docker compose -f docker-compose.prod.yml up -d --build` で変更を反映。
3.  **クリーンアップ**: `docker system prune -f` で古い不要なキャッシュイメージを削除し、ディスク容量を節約。

## 2. GitHub リポジトリでの事前設定 (重要)

GitHub のリポジトリの設定（Settings > Secrets and variables > Actions）に、以下の 3 つの **Repository secrets** を追加する必要があります。

| 名前 | 値の例 | 説明 |
| :--- | :--- | :--- |
| `SERVER_IP` | `xxx.xxx.xxx.xxx` | Xserver VPS の IP アドレス |
| `SERVER_USER` | `root` (または運用ユーザー名) | SSH 接続に使用するユーザー名 |
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | 秘密鍵の内容（全コピー） |

## 3. VPS 上での準備

1.  **パスの確認**: `deploy.yml` 内の `cd /path/to/your/project/tomoe_web` を、実際の VPS 上のパスに修正してください。
2.  **SSH 接続の許可**: GitHub Actions の実行サーバーから VPS への SSH 接続が許可されている必要があります（通常、パスワードなしの鍵認証が必要）。
3.  **リポジトリの配置**: 初回のみ、VPS 上で `git clone` を済ませておく必要があります。

---
この設定により、修正したコード（例えば Booking.com リンク追加など）をプッシュするだけで、数分後には本番環境に自動的に反映されるようになります。
設定がうまくいかない場合や、SSH 鍵の生成等でお困りの際はお気軽にお声がけください。
