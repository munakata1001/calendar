# システム全体の起動方法

グランブルーファンタジーカフェ予約システムを起動する手順です。

## 📋 前提条件

- Node.js がインストールされていること
- Python がインストールされていること

## 🚀 起動手順

### 1. バックエンドサーバーの起動（ターミナル 1つ目）

```powershell
# backendディレクトリに移動
cd backup\calendar-organized\backend

# 仮想環境を作成（初回のみ）
python -m venv venv

# 仮想環境を有効化
.\venv\Scripts\activate

# 依存パッケージをインストール（初回のみ）
pip install -r requirements.txt

# サーバーを起動
uvicorn main:app --reload
```

**成功すると**: `INFO:     Uvicorn running on http://127.0.0.1:8000`

### 2. フロントエンドサーバーの起動（ターミナル 2つ目）

**新しいターミナルウィンドウを開いてください**

```powershell
# frontendディレクトリに移動
cd backup\calendar-organized\frontend

# 依存パッケージをインストール（初回のみ）
npm install

# 開発サーバーを起動
npm start
```

**成功すると**: ブラウザが自動的に開き、http://localhost:3000 でアプリが表示されます

## ✅ 動作確認

1. ブラウザで http://localhost:3000 が開く
2. Firebase認証でログイン/新規登録できる
3. カレンダーで予約できる
4. マイページで予約を確認できる

## 🔧 トラブルシューティング

### バックエンドが起動しない

- Python がインストールされているか確認: `python --version`
- 仮想環境が正しく作成されているか確認: `backup\calendar-organized\backend\venv` フォルダが存在するか
- 詳細は `backend/SETUP.md` を参照

### フロントエンドが起動しない

- Node.js がインストールされているか確認: `node --version`
- 詳細は `frontend/SETUP.md` を参照

### API接続エラー

- バックエンドサーバーが起動しているか確認: http://localhost:8000/docs
- CORS設定が正しいか確認（デフォルトで localhost:3000 は許可されています）

## 📝 重要な注意事項

### 両方のサーバーを起動する必要があります
- バックエンド（FastAPI）: http://localhost:8000
- フロントエンド（React）: http://localhost:3000

### 初回起動のみ時間がかかります
- `npm install`: 数分〜10分程度
- `pip install`: 数分程度

### セキュリティについて
- 現在のFirebase設定はテスト用です
- 本番環境では、自分のFirebaseプロジェクトに接続してください

## 🎉 完了

両方のサーバーが起動したら、ブラウザで http://localhost:3000 にアクセスして、
「グランブルーファンタジーカフェ」にようこそ！

