#!/usr/bin/env python3
"""
sync_datenschutz_to_app.py
──────────────────────────
Liest den Inhalt von datenschutz.html, extrahiert den relevanten
Textbereich (.legal-content) und schreibt ihn über den Webhook-Endpunkt
in die App-Datenbank, damit die In-App-Datenschutzerklärung immer
mit der Website-Version übereinstimmt.

Verwendung:
    python3 sync_datenschutz_to_app.py

Umgebungsvariablen (oder direkt im Skript setzen):
    JUME_API_URL         — z.B. https://api.jume.app  (Standard)
    JUME_WEBHOOK_TOKEN   — der LEGAL_WEBHOOK_TOKEN aus /etc/jume/backend.env

Alternativ als Argumente:
    python3 sync_datenschutz_to_app.py --url https://api.jume.app --token DEIN_TOKEN
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error
from html.parser import HTMLParser
from pathlib import Path


# ── Konfiguration ─────────────────────────────────────────────────────────────

SCRIPT_DIR   = Path(__file__).parent
HTML_FILE    = SCRIPT_DIR / "datenschutz-app.html"
DEFAULT_URL  = "https://api.jume.app"
LEGAL_TYPE   = "datenschutz"
LEGAL_TITLE  = "Datenschutzerklärung"


# ── HTML-Extraktion ───────────────────────────────────────────────────────────

class _LegalContentExtractor(HTMLParser):
    """Extrahiert den Inhalt des <div class="legal-content">-Elements."""

    def __init__(self):
        super().__init__()
        self._depth = 0          # Tiefe innerhalb von .legal-content
        self._in_target = False
        self._parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        classes = attr_dict.get("class", "")
        if not self._in_target and "legal-content" in classes:
            self._in_target = True
            self._depth = 1
            return
        if self._in_target:
            self._depth += 1
            # Attribute wieder zusammenbauen
            attr_str = ""
            for name, value in attrs:
                attr_str += f' {name}="{value}"' if value is not None else f' {name}'
            self._parts.append(f"<{tag}{attr_str}>")

    def handle_endtag(self, tag):
        if not self._in_target:
            return
        self._depth -= 1
        if self._depth == 0:
            self._in_target = False
        else:
            self._parts.append(f"</{tag}>")

    def handle_data(self, data):
        if self._in_target and self._depth > 0:
            self._parts.append(data)

    def handle_entityref(self, name):
        if self._in_target:
            self._parts.append(f"&{name};")

    def handle_charref(self, name):
        if self._in_target:
            self._parts.append(f"&#{name};")

    @property
    def content(self) -> str:
        return "".join(self._parts).strip()


def extract_legal_content(html: str) -> str:
    parser = _LegalContentExtractor()
    parser.feed(html)
    content = parser.content
    if not content:
        raise ValueError(
            'Kein <div class="legal-content"> in datenschutz.html gefunden. '
            'Bitte prüfe, ob der HTML-Aufbau noch stimmt.'
        )
    return content


# ── Webhook-Aufruf ────────────────────────────────────────────────────────────

def push_to_backend(api_url: str, token: str, content: str) -> None:
    endpoint = api_url.rstrip("/") + "/api/legal/webhook"
    payload = json.dumps({
        "rechtstext_type":     LEGAL_TYPE,
        "rechtstext_title":    LEGAL_TITLE,
        "rechtstext_text":     content,
        "rechtstext_language": "de",
        "rechtstext_country":  "DE",
        "token":               token,
    }).encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Accept":       "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            if data.get("status") == "success":
                print(f"✅  Datenschutzerklärung erfolgreich in die App-Datenbank geschrieben.")
                print(f"    Endpunkt: {endpoint}")
            else:
                print(f"⚠️  Backend meldete Status: {data.get('status')}")
                print(f"    Antwort: {body}")
                sys.exit(1)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"❌  HTTP-Fehler {e.code}: {body[:400]}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌  Verbindungsfehler: {e.reason}")
        sys.exit(1)


# ── Hauptprogramm ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url",   default=os.getenv("JUME_API_URL",       DEFAULT_URL))
    parser.add_argument("--token", default=os.getenv("JUME_WEBHOOK_TOKEN", ""))
    args = parser.parse_args()

    if not args.token:
        print(
            "❌  Kein Token angegeben.\n"
            "    Setze die Umgebungsvariable JUME_WEBHOOK_TOKEN oder übergib --token <TOKEN>.\n"
            "    Den Token findest du in /etc/jume/backend.env → LEGAL_WEBHOOK_TOKEN"
        )
        sys.exit(1)

    if not HTML_FILE.exists():
        print(f"❌  {HTML_FILE} nicht gefunden.")
        sys.exit(1)

    html = HTML_FILE.read_text(encoding="utf-8")
    print(f"📄  Lese {HTML_FILE.name} ({len(html):,} Zeichen) ...")

    content = extract_legal_content(html)
    print(f"✂️   Extrahierter Inhalt: {len(content):,} Zeichen")

    print(f"🚀  Sende an {args.url} ...")
    push_to_backend(api_url=args.url, token=args.token, content=content)


if __name__ == "__main__":
    main()
