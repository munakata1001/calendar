# バックエンド環境構築手順

このディレクトリ（`backup/calendar-organized/backend`）で以下のコマンドを順番に実行してください。

## ステップ1: 仮想環境を作成

```powershell
python -m venv venv
```

## ステップ2: 仮想環境を有効化

```powershell
.\venv\Scripts\activate
```

PowerShellで実行のセキュリティエラーが出る場合は、先に以下を実行してください：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## ステップ3: 必要なパッケージをインストール

```powershell
pip install -r requirements.txt
```

## ステップ4: FastAPIサーバーを起動

```powershell
uvicorn main:app --reload
```

サーバーが起動すると、以下のメッセージが表示されます：

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## 動作確認

ブラウザで http://localhost:8000/docs を開くと、FastAPIのAPIドキュメントが表示されます。

## トラブルシューティング

### 仮想環境が見つからない
- `python -m venv venv` を実行する前に、カレントディレクトリが `backup\calendar-organized\backend` であることを確認してください。

### パッケージのインストールエラー
- インターネット接続を確認してください。
- 別の Python バージョンが必要な場合があります。`python3` を試してください。

### ポート8000が使用中
- 別のポートで起動する場合は、`uvicorn main:app --reload --port 8001` を使用してください。
- ただし、フロントエンド側の設定も変更する必要があります。

