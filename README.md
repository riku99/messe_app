# Bychance

見ていただきありがとうございます。
これは現在個人で開発している位置情報 x SNS という特徴を持つアプリです。<br />

## 主な使用技術

- ネイティブ側<br />
  TypeScript, ReactNative, Redux, ReduxToolkit, ReactNavigation など
- サーバー側<br />
  TypeScript, Node, Hapi, Prisma, Jest など

当初サーバーサイドは Ruby, Ruby on Rails で開発しており、ネイティブ側のコードと同じリポジトリ(このリポジトリ)で開発していたのでその名残があり Rails のコードも存在しています。ただ、このコードはもう使っておらず、参考としてとってあるだけです。

現在サーバー側のコードは別リポジトリで管理しています。

## 主な機能

### ログイン、ログアウト関連

- Line ログイン機能<br />
  OpenID connect を使用しています。ログイン後は自前のアクセストークンを作成し、サーバー側で保存して API へのアクセスを許可しています。

### ユーザー関連

- プロフィールの編集機能<br />
  背景には画像、動画の両方が選択可能であり、サーバー側でリサイズしています。

### 投稿関連

- インスタのような画像、動画の投稿、削除機能<br />
  インスタのような画像、動画を投稿できます。こちらもサーバー側でリサイズしています。

### メッセージ関連

- メッセージの基本的な送受信機能<br />
  socket を使いリアルタイム通信を実現しています。FCM を使いプッシュ通知も行えるようにしています。

- メッセージの未読数を表示する機能<br />
  未読のメッセージがある場合、Line のように件数が表示されます。

- トークルームの削除機能<br />
  トークルームを削除できます。削除された側のユーザーがそのトークルームでメッセージを送信した場合、「ユーザーが存在しません」と表示される仕様になっています。

- メッセージを受け取らない機能<br />
  メッセージの受け取りをオフにすることができます。ただ、送信する側のユーザーには「送信相手がメッセージを受け取るかどうか」というのはわからないようにしたいので、送信側は例え相手がメッセージを受け取らない設定にしていても送信自体は可能にしています。そのため、トーク内容が同期してない場合にも対応できるように実装しました。

### フラッシュ関連

フラッシュとはインスタのストーリーみたいなものです。

- フラッシュの投稿、削除機能<br />
  インスタのストーリーのようにカメラを開き、撮影した写真を拡大、縮小したりテキストを加えることができます。

- 閲覧機能<br />
  他のユーザーのものを閲覧する際に、まだ閲覧していないものから表示されるようにしています。<br />
  また複数ユーザーのものを連続して表示できるようになっていますが、そのユーザーが持つ全てのフラッシュを閲覧している場合そのユーザーはパスされるような仕様になっています。

- スタンプ機能<br />
  それぞれのフラッシュにスタンプを押すことができます。スタンプは複数用意されており、複数押すことが可能です。

### 他のユーザー取得関連

- 他のユーザーを見つける機能<br />
  現在地から一定の範囲に存在する他のユーザーを取得できます。フラッシュの閲覧やメッセージの送信も基本的にここからできるようにしています。<br />
  リスト形式での表示とそれぞれのユーザーの位置情報をもとにマップ上への表示がされます。

### 自分の表示関連

- 自分は非表示にする機能<br />
  自分のことは他のユーザーに対して非表示にしたい場合、設定ですることが可能です。

- プライベートゾーン設定機能<br />
  プライベートゾーンという「自分を表示させない領域」を複数設定することができます。この設定した範囲内に自分がいる場合、他のユーザーに対して自分が非表示になります。

- プライベートタイム設定機能<br />
  プライベートタイムという「自分を表示させない時間」を複数設定することができます。この時間内の場合、他のユーザーに対して自分が非表示になります。

### 位置情報関連

位置情報はサーバー側では全て暗号化されて保存されます

- 位置情報取得機能<br />
  バックグラウンドでも終了している場合でも位置情報が更新されます。また、明示的に取得することも可能です。

- 位置情報削除機能<br />
  位置情報を削除できます
  
  ---
現在ディレクトリ構成を変更しており、構成が統一されていません。

なお、上記全ては6/20日時点のものであり、変更している可能性があります。
