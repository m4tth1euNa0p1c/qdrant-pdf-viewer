import os, re
from typing import Iterator
from pypdf import PdfReader
from ..core.config import settings

def save_pdf(file_bytes: bytes, dest_name: str) -> str:
    path = os.path.join(settings.STORAGE_DIR, dest_name)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path

def iter_pdf_text_chunks(pdf_path: str, size=800, overlap=150) -> Iterator[str]:
    reader = PdfReader(pdf_path)

    def norm(s: str) -> str:
        return re.sub(r"\s+", " ", (s or "")).strip()

    step = max(1, size - min(overlap, size - 1))
    for page in reader.pages:
        text = norm(page.extract_text())
        if not text:
            continue
        i, n = 0, len(text)
        while i < n:
            yield text[i:i + size]
            i += step

def count_pages(pdf_path: str) -> int:
    return len(PdfReader(pdf_path).pages)
