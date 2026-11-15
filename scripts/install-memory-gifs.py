#!/usr/bin/env python3
"""Install only verified 480x210 GIFs from the exact 350-name inventory.

Run in a checkout of My-baby-is-23 after copying GIF assets into the
paths in assets/memory-gif-inventory.json. Hollow Knight is never touched.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "memory-gif-inventory.json"
DATA = ROOT / "memory-matching-data.js"
PAGE = ROOT / "chapters" / "memory-game.html"

def validated_gif(path: Path, width: int, height: int) -> bool:
    if not path.is_file():
        return False
    with path.open("rb") as f:
        head = f.read(13)
    if len(head) < 13 or head[:6] not in (b"GIF87a", b"GIF89a"):
        raise ValueError(f"Not a GIF: {path}")
    w = int.from_bytes(head[6:8], "little")
    h = int.from_bytes(head[8:10], "little")
    if (w, h) != (width, height):
        raise ValueError(f"Wrong GIF size ({w}x{h}): {path}")
    try:
        from PIL import Image
    except ImportError:
        raise RuntimeError("Install Pillow to validate animation frames: pip install Pillow")
    with Image.open(path) as im:
        if getattr(im, "n_frames", 1) < 2:
            raise ValueError(f"Not animated: {path}")
        for i in range(im.n_frames):
            im.seek(i)
            im.load()
    return True

def main() -> None:
    inventory = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert inventory["excluded_category"] == "hollow-knight"
    text = DATA.read_text(encoding="utf-8")
    original_hk_start = text.index("const hollowKnightGifs")
    original_hk_end = text.index("const hollowKnightRounds", original_hk_start)
    hk_before = text[original_hk_start:original_hk_end]
    count = 0
    for category, group in inventory["categories"].items():
        assert category != "hollow-knight"
        expected = group["answers"]
        assert len(expected) == 50, f"Expected 50 names in {category}"
        mappings = []
        for row in expected:
            path = ROOT / row["path"]
            if not validated_gif(path, 480, 210):
                continue
            version = hashlib.sha256(path.read_bytes()).hexdigest()[:10]
            url = "../" + row["path"] + "?v=" + version
            mappings.append("    " + json.dumps(row["name"], ensure_ascii=False) +
                            ": " + json.dumps(url, ensure_ascii=False))
            count += 1
        map_name = group["map"]
        pattern = r"(const\\s+" + re.escape(map_name) + r"\\s*=\\s*)\\{[\\s\\S]*?\\};"
        replacement = "const " + map_name + " = {\\n" + ",\\n".join(mappings) + "\\n  };"
        new_text, changed = re.subn(pattern, lambda _: replacement, text, count=1)
        if changed != 1:
            raise ValueError(f"Cannot find mapping for {category} ({map_name})")
        text = new_text
        print(f"{category}: {len(mappings)}/50 available")
    hk_start = text.index("const hollowKnightGifs")
    hk_end = text.index("const hollowKnightRounds", hk_start)
    assert text[hk_start:hk_end] == hk_before, "Hollow Knight was modified!"
    if text != DATA.read_text(encoding="utf-8"):
        DATA.write_text(text, encoding="utf-8")
        html = PAGE.read_text(encoding="utf-8")
        match = re.search(r"memory-matching-data\\.js\\?v=(\\d+)", html)
        if match:
            number = int(match.group(1)) + 1
            html = html.replace(match.group(0), f"memory-matching-data.js?v={number}", 1)
            PAGE.write_text(html, encoding="utf-8")
    print(f"Validated and linked {count}/350 GIF clues. Hollow Knight untouched.")

if __name__ == "__main__":
    main()
