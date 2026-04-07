"""One-off / maintenance: shrink school-related PNGs for iPad tile load speed."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

MAX_SIDE = 480

ROOT = Path(__file__).resolve().parent.parent / "images"


def resize_one(path: Path) -> None:
    im = Image.open(path)
    if im.mode == "P" and "transparency" in im.info:
        im = im.convert("RGBA")
    elif im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA")
    w, h = im.size
    longest = max(w, h)
    scale = min(MAX_SIDE / longest, 1.0)
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    im.save(path, format="PNG", optimize=True)
    print(path.name, im.size, path.stat().st_size // 1024, "KB")


def main() -> None:
    extra = [ROOT / "outing_school1.png"]
    for p in sorted(ROOT.glob("school*.png")):
        if p.name.startswith("school_friends_") and p.name != "school_friends.png":
            continue
        resize_one(p)
    for p in extra:
        if p.exists():
            resize_one(p)


if __name__ == "__main__":
    main()
