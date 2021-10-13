# エンジビアの泉

## セットアップ(ローカルで開発する場合)
1. .env作成
```
DATABASE_URL="mysql://root:password@localhost:3306/engivia"
```
2. 依存パッケージのインストール
```
$ npm i
```
3. dbの起動
```
$ docker-compose up -d mysql
```
4. 開発環境の起動
```
$ npm run dev
```
## セットアップ(コンテナ上で開発する場合)
1. VSCodeでDockerfileやdocker-compose.ymlがあるプロジェクトを開く
2. 拡張機能(Remote-Containers)をインストール
3. VSCodeの画面の一番左下の部分にアイコンが出てくるので、クリック
4. Reopen in Containerをクリック
5. From docker-compose.ymlをクリック
6. workspaceをクリック
7. プロジェクトのルートディレクトリに.devcontaner/devcontainer.jsonと.devcontaner/docker-compose.ymlが作成される
8. もう一度左下のアイコンをクリック
9. Reopen in Containerをクリック
10. コンテナ内でVSCodeが開けば成功。初回はビルドがあるので時間がかかります。
11. .env作成
```
DATABASE_URL="mysql://root:password@mysql:3306/engivia"
```
2. 依存パッケージのインストール
```
$ npm i
```
3. 開発環境の起動
```
$ npm run dev
```
## DBに関係のエラーが出た場合
このコマンド打つとエラーが治ることがある
```
npx prisma migtate dev
```
