import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import build  # noqa: E402


def test_build_generates_site(tmp_path):
    out = build.build(build.DEFAULT_CONTENT, tmp_path / "dist")
    html = (out / "index.html").read_text(encoding="utf-8")
    content = build.load_content(build.DEFAULT_CONTENT)

    assert content["site"]["title"] in html
    assert content["exhibition"]["period"] in html
    assert content["faq"][0]["q"] in html
    assert (out / "static" / "css" / "style.css").exists()
    assert (out / "static" / "js" / "main.js").exists()


def test_html_is_escaped(tmp_path):
    src = build.DEFAULT_CONTENT.read_text(encoding="utf-8")
    src = src.replace('lead = "あなたが動くと、空間が応える。"', 'lead = "<script>alert(1)</script>"')
    toml_path = tmp_path / "site.toml"
    toml_path.write_text(src, encoding="utf-8")

    html = (build.build(toml_path, tmp_path / "dist") / "index.html").read_text(encoding="utf-8")
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;" in html


def test_news_sorted_newest_first(tmp_path):
    src = build.DEFAULT_CONTENT.read_text(encoding="utf-8")
    src += '\n[[news]]\ndate = "2027-01-01"\ntext = "新しいお知らせ"\n'
    toml_path = tmp_path / "site.toml"
    toml_path.write_text(src, encoding="utf-8")

    news = build.load_content(toml_path)["news"]
    assert news[0]["text"] == "新しいお知らせ"
