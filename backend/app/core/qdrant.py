from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from .config import settings
from ..services.embeddings import DIM

client = QdrantClient(url=settings.QDRANT_URL)

def ensure_collection():
    names = [c.name for c in client.get_collections().collections]
    if settings.QDRANT_COLLECTION not in names:
        client.recreate_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=qm.VectorParams(size=DIM, distance=qm.Distance.COSINE),
        )
