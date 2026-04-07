#!/usr/bin/env python3
"""
Jaemin AAC 로컬 서버 — 이미지에 Cache-Control을 붙여 아이패드(홈 화면 웹앱)가
다음에 열 때 디스크 캐시를 쓰기 쉽게 합니다.

실행 (프로젝트 루트가 아니어도 됨):
  python scripts/serve_cached.py

기본 주소: http://0.0.0.0:8000/  →  아이패드에서는 http://(PC IPv4):8000/

참고: index.html 은 no-cache 로 두어 버튼/화면 수정 후 새로고침이 반영되게 했습니다.
"""
from __future__ import annotations

import http.server
import os
import socketserver

PORT = 8000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class CachedRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        path = self.path.split("?", 1)[0].lower()
        if path.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico")):
            # 사진 수정 후에는 아이패드 Safari에서 "캐시 비우기" 또는 시크릿으로 확인
            self.send_header("Cache-Control", "public, max-age=604800")
        elif path.endswith(".html") or path in ("/", ""):
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=86400")
        super().end_headers()


def main() -> None:
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), CachedRequestHandler) as httpd:
        print(f"Serving {ROOT}\n  http://127.0.0.1:{PORT}/\n  http://0.0.0.0:{PORT}/ (아이패드는 PC IP로 접속)")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
