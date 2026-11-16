#!/usr/bin/env python3
"""Synchronize the exact canonical Google Drive résumé PDF to the portfolio.

The PDF is published byte-for-byte, including its original contact information,
content, layout, metadata, and embedded links. No PDF editing or redaction occurs.
"""
from __future__ import annotations

import argparse
import hashlib
import tempfile
from pathlib import Path

import fitz
import gdown

MAXIMUM_SOURCE_BYTES = 12 * 1024 * 1024
MINIMUM_TEXT_LENGTH = 300


def validate_pdf(source_bytes: bytes) -> None:
    """Reject accidental HTML downloads, encrypted PDFs, or invalid documents."""
    if not source_bytes.startswith(b"%PDF-"):
        raise RuntimeError("Drive download did not return a PDF")
    if len(source_bytes) > MAXIMUM_SOURCE_BYTES:
        raise RuntimeError("Drive PDF exceeds the 12 MiB safety limit")

    with fitz.open(stream=source_bytes, filetype="pdf") as document:
        if document.needs_pass:
            raise RuntimeError("Drive PDF is password protected")
        if document.page_count < 1:
            raise RuntimeError("Drive PDF has no pages")
        text = "\n".join(page.get_text("text") for page in document)
        if len(text.strip()) < MINIMUM_TEXT_LENGTH:
            raise RuntimeError(
                "Drive PDF has insufficient searchable text; retaining last valid résumé"
            )


def sync(url: str, public_path: Path, root_path: Path, fingerprint_path: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="resume-drive-sync-") as temp:
        downloaded = Path(temp) / "source.pdf"
        result = gdown.download(url=url, output=str(downloaded), fuzzy=True, quiet=True)
        if not result or not downloaded.is_file():
            raise RuntimeError(
                "Cannot download the Drive résumé. Verify 'Anyone with the link — Viewer' access."
            )
        source_bytes = downloaded.read_bytes()

    validate_pdf(source_bytes)
    source_hash = hashlib.sha256(source_bytes).hexdigest()
    existing_hash = fingerprint_path.read_text().strip() if fingerprint_path.exists() else ""

    # Compare actual PDF bytes too: switching from a previously redacted copy to
    # the unchanged Drive source must still replace the published PDF.
    if (
        existing_hash == source_hash
        and public_path.is_file()
        and root_path.is_file()
        and public_path.read_bytes() == source_bytes
        and root_path.read_bytes() == source_bytes
    ):
        print("Drive source unchanged; public résumé matches it byte-for-byte")
        return

    for destination in (public_path, root_path):
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(source_bytes)

    fingerprint_path.parent.mkdir(parents=True, exist_ok=True)
    fingerprint_path.write_text(source_hash + "\n")

    assert public_path.read_bytes() == root_path.read_bytes() == source_bytes
    print(
        "Résumé synchronized without modification:",
        "sha256_prefix=" + source_hash[:12],
        "bytes=" + str(len(source_bytes)),
        "byte_identical_to_drive=True",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--public-path", default="public/Priyansh_Sharma_Resume.pdf")
    parser.add_argument("--root-path", default="Priyansh_Sharma_Resume.pdf")
    parser.add_argument("--fingerprint-path", default=".github/resume-source.sha256")
    args = parser.parse_args()
    sync(args.source_url, Path(args.public_path), Path(args.root_path), Path(args.fingerprint_path))
