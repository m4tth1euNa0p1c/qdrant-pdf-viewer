from typing import List
from sentence_transformers import SentenceTransformer

_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
DIM = _model.get_sentence_embedding_dimension()

def embed(texts: List[str], batch_size: int = 128) -> List[List[float]]:
    return _model.encode(texts, normalize_embeddings=True, batch_size=batch_size).tolist()
