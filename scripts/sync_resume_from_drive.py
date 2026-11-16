#!/usr/bin/env python3
"""Sync a public-safe résumé PDF from the single Google Drive source of truth.

The Google Drive file is never modified. The generated PDF keeps the Drive
document's existing layout except for redacting telephone numbers.
"""
from __future__ import annotations

import argparse
import hashlib
import re
import tempfile
from pathlib import Path

import fitz
import gdown

PHONE_PATTERN = re.compile(r"(?<!\d)(?:\+?91[\s-]*)?[6-9](?:[\s-]?\d){9}(?!\d)")
MINIMUM_TEXT_LENGTH = 300
MAXIMUM_SOURCE_BYTES = 12 * 1024 * 1024


def _phone_candidates(text: str) -> list[str]:
    return list(dict.fromkeys(match.group(0).strip() for match in PHONE_PATTERN.finditer(text)))


def generate_public_pdf(source_bytes: bytes) -> tuple[bytes, int]:
    if not source_bytes.startswith(b"%PDF-"):
        raise RuntimeError("Drive download was not a PDF")
    if len(source_bytes) > MAXIMUM_SOURCE_BYTES:
        raise RuntimeError("Drive PDF exceeds the 12 MiB safety limit")

    document = fitz.open(stream=source_bytes, filetype="pdf")
    if document.needs_pass:
        raise RuntimeError("Drive PDF is password protected")
    if document.page_count != 1:
        raise RuntimeError("Expected a one-page résumé PDF; refusing to silently change the page count")

    original_text = "\n".join(page.get_text("text", sort=True) for page in document)
    if len(original_text.strip()) < MINIMUM_TEXT_LENGTH:
        raise RuntimeError("Drive PDF has too little searchable text; refusing an image-only source")

    redact_count = 0
    for page in document:
        text = page.get_text("text", sort=True)
        marked_redactions = False
        for phone in _phone_candidates(text):
            rectangles = page.search_for(phone)
            if not rectangles:
                # Text extraction may join a country code into a separate span.
                digits = re.sub(r"\D", "", phone)
                rectangles = page.search_for(digits[-10:])
            if not rectangles:
                raise RuntimeError("Unable to safely locate phone text for redaction")
            for rect in rectangles:
                page.add_redact_annot(rect + (-0.5, -0.5, 0.5, 0.5), fill=(1, 1, 1))
                marked_redactions = True
                redact_count += 1

        for link in page.get_links():
            uri = link.get("uri") or ""
            if _phone_candidates(uri):
                page.delete_link(link)

        if marked_redactions:
            # Applying actual redactions removes the underlying glyphs from the PDF.
            page.apply_redactions(images=0, graphics=0)

    if redact_count:
        output = document.tobytes(garbage=4, deflate=True, clean=True)
    else:
        output = source_bytes

    verified = fitz.open(stream=output, filetype="pdf")
    final_text = "\n".join(page.get_text("text", sort=True) for page in verified)
    if _phone_candidates(final_text):
        raise RuntimeError("Public PDF still contains a detected phone number")
    if len(final_text.strip()) < MINIMUM_TEXT_LENGTH:
        raise RuntimeError("Redaction unexpectedly removed too much résumé text")
    for page in verified:
        if any(_phone_candidates(link.get("uri") or "") for link in page.get_links()):
            raise RuntimeError("Public PDF contains a telephone link")
    if verified.page_count != 1:
        raise RuntimeError("Public PDF page count changed unexpectedly")

    return output, redact_count


def sync(url: str, public_path: Path, root_path: Path, fingerprint_path: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="resume-drive-sync-") as temp:
        downloaded = Path(temp) / "source.pdf"
        result = gdown.download(url=url, output=str(downloaded), fuzzy=True, quiet=True)
        if not result or not downloaded.is_file():
            raise RuntimeError(
                "Cannot download the Drive résumé. Verify 'Anyone with the link — Viewer' access."
            )
        source_bytes = downloaded.read_bytes()

    source_hash = hashlib.sha256(source_bytes).hexdigest()
    existing_hash = fingerprint_path.read_text().strip() if fingerprint_path.exists() else ""
    if (
        existing_hash == source_hash
        and public_path.is_file()
        and root_path.is_file()
        and public_path.read_bytes() == root_path.read_bytes()
    ):
        print("Drive source unchanged; public résumé already synchronized")
        return

    public_bytes, redact_count = generate_public_pdf(source_bytes)

    for destination in (public_path, root_path):
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(public_bytes)
    fingerprint_path.parent.mkdir(parents=True, exist_ok=True)
    fingerprint_path.write_text(source_hash + "\n")

    print(
        "Résumé synchronized:",
        "source_sha256_prefix=" + source_hash[:12],
        "public_bytes=" + str(len(public_bytes)),
        "redactions=" + str(redact_count),
        "source_layout_retained=True",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--public-path", default="public/Priyansh_Sharma_Resume.pdf")
    parser.add_argument("--root-path", default="Priyansh_Sharma_Resume.pdf")
    parser.add_argument("--fingerprint-path", default=".github/resume-source.sha256")
    args = parser.parse_args()
    sync(args.source_url, Path(args.public_path), Path(args.root_path), Path(args.fingerprint_path))
