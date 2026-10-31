# 須田亮介 / Ryosuke Suda — personal website

公開先: https://ryos-physrockme.github.io/

須田亮介の個人サイト。
日本語・英語の自己紹介と、論文・発表一覧を掲載する。
所属・学年は自己紹介、共通ヘッダー、フッターに掲載しない。
研究関心は「場の理論・数理物理」と「AI for theoretical physics」を中心に、
現象論および数学・物性物理・情報科学・工学との双方向の応用も含める。
白地の1列構成を基本とし、本文と業績を通常の見出しとリンクで掲載する。
リンク・見出し・罫線には紫を使用する。

## 構成と統合

このリポジトリを今後の更新元とする。旧 `personal-website-in-laboratory` の
自己紹介、研究関心、外部プロフィール、日英ページ、静的配布の方針を引き継いだ。
サンプル業績・仮CV・サンプルブログは掲載しない。旧リポジトリは履歴保管用として残す。

配信はHTML/CSS/JavaScriptのみ。ビルドはNode.js 20以上の標準機能を使用し、
npmパッケージのインストールやサーバー側のプログラムは不要。

| ファイル | 役割 |
| --- | --- |
| `scripts/build.mjs` | 日英の本文・共通レイアウト・6ページの生成 |
| `assets/site.css` | モバイル・印刷対応のスタイル |
| `data/publications.json` | 論文の書誌情報 |
| `data/talks.json` | Sheetsから取得した発表の保存済みデータ |
| `data/sources.json` | 公開CSVの取得先、保存済みデータの取得日 |
| `assets/records.mjs` | CSV解釈、日付・URL検証、HTMLエスケープ |
| `assets/achievements.mjs` | Sheets更新、発表の検索・絞り込み |
| `assets/math.mjs` | KaTeXによる数式表示。初期表示・一覧更新・絞り込みに対応 |
| `assets/vendor/katex-0.19.1/` | 同梱するKaTeX本体、CSS、フォント、MITライセンス |
| `data/card.json` | 名刺に掲載する氏名、所属、学年、メール、サイトURL |
| `scripts/card.mjs` | 日英の名刺ページ生成 |
| `scripts/card-assets.py` | QRコードと保存用PNGの再生成 |

## 更新

```bash
node scripts/sync.mjs
node scripts/build.mjs
node --test tests/*.test.mjs
```

生成された `index.html`, `en/`, `achievements/`, `card/` もGitにコミットする。
ページ間リンクとCSS・スクリプトのURLには、共通の内容ハッシュをクエリとして付ける。
更新後に以前のページがブラウザのキャッシュから表示されるのを避けるためのもの。
ブックマークなどから開いた古いページ自体が残っている場合は、再読み込みで最新版に切り替える。
GitHub Pagesは `main` ブランチのルートを配信する構成。`.nojekyll` でJekyll処理を無効にする。
公開先設定: Settings → Pages → Deploy from a branch → main / (root)。

## Google Sheets

### 数式の入力

論文・発表の題目、著者、掲載誌・研究会名などでは、数式部分を `$...$` または
`\(...\)` で囲む。例えば、スプレッドシートには次のように入力する:

```text
Lepton flavor violating decay of true muonium: $(\mu^+\mu^-) \to \mu^\pm e^\mp$
Integrable $T\bar{T}$ deformations
```

`$$...$$` と `\[...\]` は独立した行の数式に対応する。
JSONファイルを直接編集する場合は、バックスラッシュを `\\` と書く。
数式モード外の文字は通常の文章として扱う。LaTeX文書全体やプリアンブルは処理しない。
対応コマンドは https://katex.org/docs/supported を参照。
未対応の命令・不正な数式は文字として残し、ほかの業績の表示を続ける。
各業績のマクロ定義は独立し、TeXからのリンク・HTML挿入は許可しない。

KaTeX 0.19.1の配布ファイルを変更せず同梱し、閲覧時に外部配信サービスへ接続しない。
通常のビルドにnpmパッケージのインストールは不要。
バージョン更新時は https://www.npmjs.com/package/katex の公式パッケージから
`dist/katex.mjs`, `dist/katex.min.css`, `dist/contrib/auto-render.mjs`, `dist/fonts/`,
`LICENSE` を新しいバージョンのディレクトリへコピーし、インポートとCSSのパスを更新する。

### 発表

「実績一覧」の `achievements` タブ（gid 1161905400）を使用。
既存の公開読み取り設定を利用し、共有設定は変更していない。
業績ページを開くと公開CSVを取得する。Google側のキャッシュで反映に時間がかかる場合がある。
通信失敗、権限変更、列名不一致、空応答の場合は保存済みの一覧を表示する。
JavaScript無効時も論文・発表はHTMLに含まれる。検索・種別・年で絞り込み可能。

必須列: 「タイトル」「著者一覧」「会議名」「発表日」「発表種別」。
フォームのタイムスタンプや内部タグは公開用データに含めない。

### 論文

初期データは「論文実績投稿（回答）」の2件と、arXivで確認した追加3件。
元シートは非公開のため、認証済み読み取りで一度取り込んだ保存済みデータを使用する。
継続的な自動同期は未設定。元シートのID・認証情報を公開サイトに埋め込まない。
公開情報の確認日: 2026-10-31。未確認の採択・出版状況は推測しない。

非公開を保ったまま、手元にダウンロードしたCSVで更新できる:

```bash
node scripts/sync.mjs --publications-csv /path/to/publications.csv
node scripts/build.mjs
```

既存の「タイトル」「著者一覧」「arXiv情報」「雑誌名・巻号・頁」「発行年」「参考URL(あれば)」に対応。
同一arXiv番号はシートの内容を優先して更新し、シート未登録の補完論文は残す。
削除が必要な論文は `data/publications.json` から削除する。

別途公開用の論文タブを用意した場合、そのCSV URLを設定できる:

```bash
node scripts/sync.mjs --publications-url 'https://docs.google.com/spreadsheets/d/PUBLIC_SHEET_ID/gviz/tq?tqx=out:csv&gid=PUBLIC_TAB_ID'
node scripts/build.mjs
```

設定後は業績ページ閲覧時にも同期する。トップの「最近の論文」はビルド時点の内容。
認証用トークンやサービスアカウント鍵を公開リポジトリに置かないこと。

## 研究室サーバーへ配置

```bash
node scripts/export.mjs
```

`dist/` の中身をWeb公開ディレクトリへコピーする。内部リンクはすべて相対パスなので、
`/~username/` 等のサブディレクトリでも同じ出力を使える。
`dist/` には公開ファイルだけを含め、Git履歴、スクリプト、設定ファイルは含めない。
SSH接続可能な手元の端末では次のコマンドも利用可能:

```bash
bash scripts/deploy-lab.sh user@host:/absolute/web/directory/
```

通常のSSH鍵または対話的なパスワード認証を使用し、既存リモートファイルは削除しない。
実際のサーバー名・配置先・認証設定は未設定。

## 名刺形式の表示

自己紹介文の直下に「名刺形式で表示 ↗」ボタンを配置する。日本語は `card/`、
英語は `en/card/` を新しいタブで開く。所属と学年は名刺内に掲載する。
QRコードはWebsite（サイトのトップ）とEmail（メール作成）の2つで、タップすると拡大する。
`assets/ryosuke-suda-card.png` は1080 × 1440ピクセルの保存用画像。
HTML・SVG・PNGは静的ファイルとして配信し、外部のQR生成サービスは利用しない。

所属・学年・連絡先を変更するときは `data/card.json` を編集する。
PillowとqrcodeをインストールしたPython環境で、日本語フォントを指定して画像を再生成する:

```bash
python scripts/card-assets.py --font /path/to/JapaneseFont.ttf
node scripts/export.mjs
```

生成されたPNG・SVG・HTMLもコミットする。通常のサイトビルドにはPythonは不要。
