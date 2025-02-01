# Seat Changer

Seat Changer は、クラスの席替えを行うための Web アプリケーションです。ユーザーはクラスの人数、席数、隣に座らせたくないペア、固定席を設定し、席替えを実行できます。また、席替え結果を画像として生成することもできます。

## セットアップ

### 必要条件

- Node.js (バージョン 14 以上)
- npm (Node.js に含まれています)

### インストール

1. リポジトリをクローンします。

   ```bash
   git clone https://github.com/yourusername/seat-changer.git
   cd seat-changer
   ```

2. 依存関係をインストールします。

   ```bash
   npm install
   ```

3. 環境変数を設定します。`.env`ファイルを作成し、以下の内容を追加します。

   ```plaintext
   PORT=3000
   ```

### 実行

開発サーバーを起動します。

```bash
npm start
```

ブラウザで以下の URL にアクセスします。

```url
http://localhost:3000
```

### テスト

テストを実行します。

```bash
npm test
```

## 使用方法

1. クラスの人数、縦の席数、横の席数を入力します。
2. 隣に座らせたくない生徒のペアを追加します。
3. 固定席を追加します。
4. 「席替えを実行」ボタンをクリックして、席替えを実行します。
5. 席替え結果が表示されます。
6. 「画像を生成」ボタンをクリックして、席替え結果を画像として生成します。

## ディレクトリ構造

```txt
seat-changer/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── __tests__/
│   └── app.test.js
├── api.mjs
├── server.mjs
├── package.json
└── README.md
```

## ライセンス

このプロジェクトは、[ISC ライセンス](LICENSE)の下でライセンスされています。
