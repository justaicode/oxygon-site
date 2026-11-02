#!/usr/bin/env python3
"""Stamp local stylesheet/script URLs with their content hash. Never publishes."""
import hashlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, parse_qsl, urlencode
import re

SITE = Path(__file__).resolve().parents[1]

def version_pages():
    for page in SITE.rglob('*.html'):
        text = page.read_text()
        # Work only on real tags, excluding script bodies and embedded page templates.
        class Assets(HTMLParser):
            def __init__(self):
                super().__init__(convert_charrefs=False)
                self.edits = []
            def handle_starttag(self, tag, attrs):
                a = dict(attrs)
                key = 'src' if tag == 'script' else 'href' if tag == 'link' and a.get('rel') == 'stylesheet' else None
                if not key or not a.get(key):
                    return
                url = urlsplit(a[key])
                if url.scheme or url.netloc:
                    return
                asset = (SITE / url.path.lstrip('/') if url.path.startswith('/') else page.parent / url.path).resolve()
                if not asset.is_relative_to(SITE) or not asset.is_file():
                    return
                version = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
                query = urlencode([(k, v) for k, v in parse_qsl(url.query) if k != 'v'] + [('v', version)])
                updated = url._replace(query=query).geturl()
                tagtext = self.get_starttag_text()
                match = re.search(r'\b' + key + r'\s*=\s*(["\'])(.*?)\1', tagtext)
                if match:
                    line, col = self.getpos()
                    start = sum(len(s) for s in text.splitlines(keepends=True)[:line-1]) + col
                    self.edits.append((start + match.start(2), start + match.end(2), updated))
        parser = Assets()
        parser.feed(text)
        for start, end, value in reversed(parser.edits):
            text = text[:start] + value + text[end:]
        if parser.edits:
            page.write_text(text)

if __name__ == '__main__':
    version_pages()
