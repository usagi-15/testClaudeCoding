# testClaudeCoding

展示作品『My Cover』（武蔵野美術大学 デザイン情報学科3年ゼミ展）の紹介ページ（静的サイト）を Python で生成するプロジェクトです。

## 使い方

```bash
pip install -r requirements.txt
python build.py            # dist/ にサイトを生成
python build.py --serve    # 生成後 http://localhost:8000 でプレビュー
python -m pytest           # テスト
```

掲載内容は `site.toml` を編集して変更します。画像は `static/images/` に置き、`site.toml` の `image` に指定します（未指定の間は正方形のプレースホルダー枠を表示）。
未確定の項目は `【要記入】` になっています。
## 公開（GitHub Pages）

`main` ブランチに変更が入ると、GitHub Actions（`.github/workflows/pages.yml`）がテスト・サイト生成を行い、自動で公開します。

- 公開URL: https://usagi-15.github.io/testClaudeCoding/
- 初回のみ、GitHub の Settings → Pages → Build and deployment の Source を「GitHub Actions」にする必要があります。
- 手動で公開し直すときは Actions タブ →「Deploy site to GitHub Pages」→「Run workflow」。
