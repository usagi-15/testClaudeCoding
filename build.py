"""展示PRサイトの静的サイトジェネレーター。

使い方:
    python build.py            # dist/ にサイトを生成
    python build.py --serve    # 生成後、http://localhost:8000 でプレビュー
"""

from __future__ import annotations

import argparse
import functools
import http.server
import shutil
import tomllib
from datetime import date
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

ROOT = Path(__file__).resolve().parent
TEMPLATES_DIR = ROOT / "templates"
STATIC_DIR = ROOT / "static"
DEFAULT_CONTENT = ROOT / "site.toml"
DEFAULT_OUT = ROOT / "dist"


def load_content(path: Path) -> dict:
    """TOML ファイルから掲載内容を読み込む。"""
    with path.open("rb") as f:
        content = tomllib.load(f)
    # お知らせは新しい順に並べる
    content["news"] = sorted(content.get("news", []), key=lambda n: str(n["date"]), reverse=True)
    content.setdefault("faq", [])
    return content


def build(content_path: Path = DEFAULT_CONTENT, out_dir: Path = DEFAULT_OUT) -> Path:
    """サイトを生成し、出力先ディレクトリを返す。"""
    content = load_content(content_path)
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape(["html"]),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    shutil.copytree(STATIC_DIR, out_dir / "static")

    html = env.get_template("index.html").render(**content, build_year=date.today().year)
    (out_dir / "index.html").write_text(html, encoding="utf-8")
    return out_dir


def serve(out_dir: Path, port: int) -> None:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(out_dir))
    with http.server.ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"プレビュー: http://localhost:{port}  (Ctrl+C で終了)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


def main() -> None:
    parser = argparse.ArgumentParser(description="展示PRサイトを生成します。")
    parser.add_argument("--content", type=Path, default=DEFAULT_CONTENT, help="掲載内容の TOML ファイル")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="出力先ディレクトリ")
    parser.add_argument("--serve", action="store_true", help="生成後にローカルサーバーを起動する")
    parser.add_argument("--port", type=int, default=8000, help="プレビュー用ポート")
    args = parser.parse_args()

    out = build(args.content, args.out)
    print(f"生成完了: {out / 'index.html'}")
    if args.serve:
        serve(out, args.port)


if __name__ == "__main__":
    main()
