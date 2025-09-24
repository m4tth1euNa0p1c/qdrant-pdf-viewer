from typing import List
from uuid import uuid4
from qdrant_client.http import models as qm
from ..core.config import settings
from ..core.qdrant import client
from .embeddings import embed
from sqlmodel import Session, select
from ..models.base import engine
from ..models.document import Document

COL = settings.QDRANT_COLLECTION

def upsert_chunks(doc_id: int, chunks: List[str], source_name: str):
    if not chunks:
        return
    vectors = embed(chunks)
    points = [
        qm.PointStruct(
            id=uuid4().hex,
            vector=v,
            payload={"text": t, "source": source_name, "document_id": int(doc_id)},
        )
        for v, t in zip(vectors, chunks)
    ]
    client.upsert(collection_name=COL, points=points)


def search(query: str, top_k: int):
    with Session(engine) as s:
        ids = s.exec(select(Document.id)).all()  # -> List[int]
    ids = [int(i) for i in ids if i is not None]
    if not ids:
        return []

    qvec = embed([query])[0]

    qfilter = qm.Filter(
        must=[qm.FieldCondition(key="document_id", match=qm.MatchAny(any=ids))]
    )

    res = client.search(
        collection_name=COL,
        query_vector=qvec,
        limit=top_k,
        query_filter=qfilter,
    )
    out = []
    for hit in res:
        payload = hit.payload or {}
        out.append((payload.get("text", ""), float(hit.score or 0.0), payload.get("source", ""), hit.id))
    return out

def delete_by_document(doc_id: int):
    client.delete(
        collection_name=COL,
        points_selector=qm.FilterSelector(
            filter=qm.Filter(
                must=[qm.FieldCondition(key="document_id", match=qm.MatchValue(value=int(doc_id)))]
            )
        ),
        wait=True,
    )

def purge_all():
    client.delete_collection(collection_name=COL)
