# グランブルーファンタジーカフェ予約システム - 整理版

このディレクトリは、元の `backup/calendar/` と同じ機能を持ちつつ、ディレクトリ構造が整理されたバージョンです。

## ディレクトリ構成

```
calendar-organized/
├── backend/           # バックエンド（FastAPI）
│   ├── main.py
│   └── requirements.txt
└── frontend/          # フロントエンド（React）
    ├── src/
    ├── public/
    ├── package.json
    └── package-lock.json
```

## セットアップ方法

### 1. フロントエンドとバックエンドのファイルをコピー

以下の手順でファイルをコピーしてください：

**フロントエンドのファイルをコピー:**
1. `backup/calendar/src/` を `backup/calendar-organized/frontend/src/` にコピー
2. `backup/calendar/public/` を `backup/calendar-organized/frontend/public/` にコピー
3. `backup/calendar/package.json` を `backup/calendar-organized/frontend/package.json` にコピー
4. `backup/calendar/package-lock.json` を `backup/calendar-organized/frontend/package-lock.json` にコピー

**手動でコピーする場合:**
ファイルエクスプローラーで以下のフォルダをコピーしてください：
- `backup/calendar/src/` → `backup/calendar-organized/frontend/src/`
- `backup/calendar/public/` → `backup/calendar-organized/frontend/public/`
- `backup/calendar/package.json` → `backup/calendar-organized/frontend/package.json`
- `backup/calendar/package-lock.json` → `backup/calendar-organized/frontend/package-lock.json`

### 2. バックエンドの起動

```powershell
cd backup\calendar-organized\backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. フロントエンドの起動（別のターミナル）

```powershell
cd backup\calendar-organized\frontend
npm install
npm start
```

## 現在の状態

✅ **完了:**
- `backend/main.py` - FastAPIサーバーのコード（元の処理をそのまま保持）
- `backend/requirements.txt` - 必要なPythonパッケージ
- `frontend/package.json` - Reactアプリケーションの設定

⏳ **手動でコピーが必要:**
- `frontend/src/` - Reactコンポーネント
- `frontend/public/` - 静的ファイル
- `frontend/package-lock.json` - 依存関係のロックファイル

## 元のディレクトリとの違い

- **元の構成**: `backup/calendar/` - フロントエンドとバックエンドが混在
- **新しい構成**: `backup/calendar-organized/` - `backend/` と `frontend/` に完全に分離
- **処理内容**: 全く同じ（動作に影響なし）

## 使用方法

ファイルをコピーし終わったら、上記の「セットアップ方法」に従って起動してください。

