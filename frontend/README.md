# フロントエンド（React アプリケーション）

このディレクトリには、グランブルーファンタジーカフェ予約システムのフロントエンドがあります。

## ディレクトリ構成

```
frontend/
├── public/
│   ├── index.html          # HTMLエントリーポイント
│   ├── manifest.json       # PWA設定
│   └── robots.txt          # 検索エンジン設定
├── src/
│   ├── App.js              # メインコンポーネント
│   ├── App.css             # スタイル
│   ├── components/         # Reactコンポーネント
│   │   ├── auth/          # 認証関連コンポーネント
│   │   ├── Calendar/      # カレンダーコンポーネント
│   │   ├── BookingDrawer.jsx
│   │   └── MyPage.jsx
│   ├── assets/            # 画像ファイル
│   ├── constants/         # 定数設定
│   ├── utils/             # ユーティリティ関数
│   └── firebase.js        # Firebase設定
├── package.json           # 依存関係
└── .gitignore            # Git除外設定
```

## クイックスタート

```powershell
# 1. 依存パッケージをインストール
npm install

# 2. 開発サーバーを起動
npm start
```

詳細な手順は `SETUP.md` を参照してください。

## 必要な環境

- Node.js (v14以上推奨)
- npm (Node.jsに同梱)

## 機能

- ✅ Firebase認証（ログイン/新規登録）
- ✅ カレンダー表示と予約システム
- ✅ マイページ（予約履歴確認・キャンセル）
- ✅ リアルタイム予約状況表示
- ✅ レスポンシブデザイン

## バックエンドとの連携

- **APIエンドポイント**: http://127.0.0.1:8000
- **CORS設定**: localhost:3000からのリクエストを許可

## Firebase設定

現在、Firebase認証を使用しています。
本番環境では、自分のFirebaseプロジェクトに接続することを推奨します。

## 開発コマンド

```powershell
# 開発サーバー起動（ホットリロード）
npm start

# 本番用ビルド
npm run build

# テスト実行
npm test

# 依存関係の確認
npm list
```

## トラブルシューティング

詳細なトラブルシューティングは `SETUP.md` を参照してください。

