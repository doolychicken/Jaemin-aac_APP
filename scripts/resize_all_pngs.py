"""Resize every PNG in the images/ folder to at most MAX_SIDE px on the longest side.

Usage:
  python scripts/resize_all_pngs.py           # resize all PNGs
  python scripts/resize_all_pngs.py --check   # show sizes without changing files
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed.  Run:  pip install Pillow")

MAX_SIDE = 480          # longest side in pixels — good balance for iPad Retina tiles
ROOT = Path(__file__).resolve().parent.parent / "images"

SKIP_PATTERNS = [
    # YouTube thumbnails or anything that isn't a local tile image
]


def resize_one(path: Path, dry_run: bool = False) -> tuple[int, int]:
    """Return (original_kb, new_kb).  If dry_run, file is not modified."""
    im = Image.open(path)
    orig_kb = path.stat().st_size // 1024

    # Normalise palette / mode
    if im.mode == "P" and "transparency" in im.info:
        im = im.convert("RGBA")
    elif im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA")

    w, h = im.size
    longest = max(w, h)
    scale = min(MAX_SIDE / longest, 1.0)

    if scale < 1.0 and not dry_run:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        im.save(path, format="PNG", optimize=True)
        new_kb = path.stat().st_size // 1024
    else:
        new_kb = orig_kb

    return orig_kb, new_kb


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true",
                        help="Print sizes without modifying files")
    args = parser.parse_args()

    pngs = sorted(ROOT.glob("*.png"))
    if not pngs:
        print(f"No PNG files found in {ROOT}")
        return

    total_before = total_after = 0
    changed = 0

    print(f"{'File':<50} {'Before':>8} {'After':>8}  {'Status'}")
    print("-" * 80)

    for p in pngs:
        before, after = resize_one(p, dry_run=args.check)
        total_before += before
        total_after += after
        status = "shrunk" if after < before else "ok"
        if after < before:
            changed += 1
        print(f"{p.name:<50} {before:>6} KB  {after:>6} KB  {status}")

    print("-" * 80)
    print(f"{'TOTAL':<50} {total_before:>6} KB  {total_after:>6} KB  "
          f"({changed} files {'would be ' if args.check else ''}resized)")


if __name__ == "__main__":
    main()
