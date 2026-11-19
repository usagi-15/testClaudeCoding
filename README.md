# testClaudeCoding

インタラクション作品の展示PR用ホームページ（静的サイト）を Python で生成するプロジェクトです。

## 使い方

```bash
pip install -r requirements.txt
python build.py            # dist/ にサイトを生成
python build.py --serve    # 生成後 http://localhost:8000 でプレビュー
python -m pytest           # テスト
```

掲載内容（作品名・会期・会場・FAQ など）は `site.toml` を編集して変更します。
生成された `dist/` フォルダをそのまま GitHub Pages 等の静的ホスティングに配置できます。
