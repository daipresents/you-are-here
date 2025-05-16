# You are here

## ja

特定の URL に反応してバナーを表示させる Chrome 拡張です。URL とバナーの色を設定可能です。開発環境、STG 環境、本番環境の URL を設定しておけば、「えーっといまどこの環境だっけ？」とならないはずです。この拡張の内部ではデータ送信を行っていないため、安心してお使いいただけます。

## en

If you set the URLs for the development environment, STG environment, and production environment, you should not have to ask yourself, “Well, which environment am I in now? You should not be able to say, “Oh, where am I now? This extension does not transmit data internally, so you can use it with peace of mind.

## インストール

1. 拡張を読み込む（chrome://extensions/ → デベロッパーモード → 読み込む）
2. 拡張アイコンをクリック → ポップアップで設定
3. 任意の URL にアクセスすると、設定に一致すればバナー表示

## 公開

zip ファイルに固めて Chrome ウェブストアで公開。

```bash
cd you-are-here
zip -r ~/Downloads/you-are-here.zip . -x ".*" -x "__MACOSX" -x "*/.*"
```
