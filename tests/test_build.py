import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import build  # noqa: E402


def _build_with(tmp_path, replace=None, append=""):
    src = build.DEFAULT_CONTENT.read_text(encoding="utf-8")
    for old, new in (replace or {}).items():
        assert old in src
        src = src.replace(old, new, 1)
    path = tmp_path / "site.toml"
    path.write_text(src + append, encoding="utf-8")
    out = build.build(path, tmp_path / "dist")
    return (out / "index.html").read_text(encoding="utf-8")


def test_build_generates_site(tmp_path):
    out = build.build(build.DEFAULT_CONTENT, tmp_path / "dist")
    html = (out / "index.html").read_text(encoding="utf-8")
    content = build.load_content(build.DEFAULT_CONTENT)

    assert content["site"]["title"] in html
    assert content["exhibition"]["period"] in html
    assert content["research"]["notice"] in html  # 来場者向け注意書きは掲載必須
    for section in ["about", "covers", "experience", "research", "system", "exhibition", "credit"]:
        assert f'id="{section}"' in html
    assert html.count('class="step"') == 6
    assert "built-in method" not in html  # dict のメソッド名と衝突したキーがそのまま出力されていないこと
    assert "操作用モニター" in html
    assert (out / "static" / "css" / "style.css").exists()
    assert (out / "static" / "js" / "main.js").exists()


def test_html_is_escaped(tmp_path):
    html = _build_with(tmp_path, {'lead = "同じ1曲を': 'lead = "<script>alert(1)</script>同じ1曲を'})
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;" in html


def test_empty_image_shows_placeholder(tmp_path):
    html = _build_with(tmp_path)
    assert "square__placeholder" in html
    assert 'id="bleed-canvas"' in html  # メインビジュアル未設定時はにじみ演出


def test_image_is_rendered_with_alt(tmp_path):
    html = _build_with(tmp_path, {
        'image = ""\nalt = "【要記入】メインビジュアルの説明"':
        'image = "static/images/main.jpg"\nalt = "青くにじんだジャケット"',
    })
    assert '<img class="hero__img" src="static/images/main.jpg" alt="青くにじんだジャケット"' in html
    assert 'id="bleed-canvas"' not in html


def test_news_sorted_newest_first(tmp_path):
    src = build.DEFAULT_CONTENT.read_text(encoding="utf-8")
    src = src.replace('[[news]]\ndate = "【要記入】"\ntext = "【要記入】"\n', "")
    src += '\n[[news]]\ndate = "2026-11-01"\ntext = "古い"\n[[news]]\ndate = "2026-12-01"\ntext = "新しい"\n'
    path = tmp_path / "site.toml"
    path.write_text(src, encoding="utf-8")
    news = build.load_content(path)["news"]
    assert [n["text"] for n in news] == ["新しい", "古い"]
