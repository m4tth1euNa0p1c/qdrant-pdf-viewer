from fastapi import APIRouter, UploadFile, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from ..models.base import engine
from ..models.document import Document
from ..services.storage import save_pdf, iter_pdf_text_chunks, count_pages
from ..services.vectorstore import upsert_chunks, delete_by_document
import os

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("")
def list_docs():
    with Session(engine) as s:
        return s.exec(select(Document).order_by(Document.created_at.desc())).all()

def _ingest_pdf(doc_id: int, path: str, original_name: str):
    from sqlmodel import Session
    with Session(engine) as s:
        if not s.get(Document, doc_id):
            return
    batch, B = [], 256
    count = 0




    for ch in iter_pdf_text_chunks(path):
        count += 1
        if count % 100 == 0: 
            with Session(engine) as s:
                if not s.get(Document, doc_id):
                    return

        ch = (ch or "").strip()
        if not ch:
            continue
        batch.append(ch)
        if len(batch) >= B:
            upsert_chunks(doc_id, batch, original_name)
            batch.clear()
    if batch:
        upsert_chunks(doc_id, batch, original_name)





@router.post("/upload")
async def upload_doc(file: UploadFile, background: BackgroundTasks):

    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(400, "Only PDF accepted") 

    content = await file.read()
    if not content:
        raise HTTPException(400, "Empty file")

    # créer la row vide pour avoir l'id
    with Session(engine, expire_on_commit=False) as s:
        doc = Document(filename="", original_name=file.filename, bytes_size=len(content))
        s.add(doc); s.commit(); s.refresh(doc)
        doc_id = doc.id

    dest_name = f"doc_{doc_id}.pdf"
    path = save_pdf(content, dest_name)
    pages = count_pages(path)

    # maj de la row avec le vrai nom et le nombre de pages
    with Session(engine, expire_on_commit=False) as s:
        d = s.get(Document, doc_id)
        if not d:
            try: os.remove(os.path.join("./storage", dest_name))
            except Exception: pass
            raise HTTPException(500, "Document row disappeared")
        d.filename = dest_name
        d.pages = pages
        s.add(d); s.commit()

    # ingestion en tâche de fond (non bloquante)
    background.add_task(_ingest_pdf, doc_id, path, file.filename)

    return {"id": doc_id, "pages": pages, "filename": file.filename, "status": "ingesting"}

@router.delete("/{doc_id}")
def delete_doc(doc_id: int):
    try:
        delete_by_document(doc_id)
    except Exception:
        pass

    # suppression du fichier et de la row en DB (s’il existe)
    file_removed = False
    with Session(engine) as s:
        doc = s.get(Document, doc_id)
        if doc:
            file_path = os.path.join("./storage", doc.filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    file_removed = True
                except Exception:
                    pass
            s.delete(doc)
            s.commit()
            return {"ok": True, "deleted": True, "file_removed": file_removed}

    # Pas de row en DB : suppression idempotente
    guessed = os.path.join("./storage", f"doc_{doc_id}.pdf")
    if os.path.exists(guessed):
        try:
            os.remove(guessed)
            file_removed = True
        except Exception:
            pass

    return {"ok": True, "deleted": False, "already_gone": True, "file_removed": file_removed}

@router.post("/purge")
def purge_collection():
    from ..services.vectorstore import purge_all
    try:
        purge_all()
        return {"ok": True}
    finally:
        from ..core.qdrant import ensure_collection
        ensure_collection()
