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
生成された `dist/` フォルダをそのまま GitHub Pages 等の静的ホスティングに配置できます。
