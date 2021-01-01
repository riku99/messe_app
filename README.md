# Bychance

現在進行形で作っているアプリ。

## どのようなアプリか

たまたま近くにいた人と繋がれたり、その時同じイベント(スポーツ観戦やライブなど)にいる人のシェアしたモノをインスタのストーリーのような形で見れたりできるアプリ。

ゆくゆくはもっと色んなことができるようにしたい。

## アプリ名の由来

たまたま近くにいた人、たまたま同じイベントにいた人など、たまたま(偶然)を英語にすると by chance となるのでそこからとりました！

## 主な使用技術

+ TypeScript, ReactNative, Redux, Redux Toolkit, hooks など
+ Ruby, Ruby On Rails
+ Docker/Docker-compose
+ OpenID Connect
+ WebSocket
+ AWS<br>
  * S3

## 主な機能
+ ユーザー登録、ログイン(Lineログイン)<br>
 今後はパスワードとユーザー名を使用したよくあるログイン機能も実装する予定<br>
+ プロフィール編集
+ インスタのような画像投稿
+ ストーリーのような期間限定、かつ連続で表示される画像、動画の投稿
+ メッセージのやり取り
+ 指定した範囲に存在するユーザーの取得
+ 自分のデバイスで写真、動画の撮影、投稿

## 現時点でのデモgif

**アプリを開いてからログインまで**<br>
+ 注意点
  * 画像で隠している部分があります
  * デザインなどはあまりまだ手をつけてられてないので、ログイン画面は今後しっかりしたものを作ります
  * アプリ名やチャンネル名もまだ設定、変更を行っておらずそのままなので不自然です
 
 ![login_demo](https://user-images.githubusercontent.com/52064725/103432480-d3be5f80-4c22-11eb-808a-d872a8d9bbba.gif)
 
 **プロフィール編集**
 
 + 注意点
   * 自己紹介の編集で複数の改行を行ったにも関わらず、結果1回の改行になっていますがこれは仕様でそうしています。
 
 ![edit_profile_demo](https://user-images.githubusercontent.com/52064725/103433009-02413800-4c2d-11eb-88b2-b7a57a8b49cd.gif)

 
**フラッシュを撮って投稿するまで**

+ 注意点
  * フラッシュとはいわゆるインスタのストーリーズみたいなものです
  * 写真の撮影、フォルダからの選択、撮影したものをフォルダに保存することもできます
  
![take_flash_demo](https://user-images.githubusercontent.com/52064725/103432511-4c252080-4c23-11eb-9148-5ad6de5475c0.gif)

**フラッシュを表示する**

+ 注意点
  * 動画が止まったり、画面上部にあるプログレスバーが止まったりしますがこれはインスタのストーリーのように自分でタップして操作しているものです

![show_flash_demo](https://user-images.githubusercontent.com/52064725/103432769-b8eee980-4c28-11eb-91ed-f364a0699a79.gif)


