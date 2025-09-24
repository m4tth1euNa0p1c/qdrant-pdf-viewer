import httpx
from ..core.config import settings
from .vectorstore import search

SYS = (
    "You are a concise assistant. Use CONTEXT to answer. "
    "If not in context, say you don't know. "
    "Cite sources as [1], [2] using provided blocks."
)

def format_context(hits):
    blocks = []
    for i, (text, score, source, _id) in enumerate(hits, 1):
        blocks.append(f"[{i}] (score={score:.3f}) source={source}\n{text}")
    return "\n\n".join(blocks)

def chat(query: str):
    hits = search(query, settings.TOP_K)
    ctx = format_context(hits) if hits else "(no context)"
    messages = [
        {"role": "system", "content": SYS},
        {"role": "user", "content": f"QUESTION:\n{query}\n\nCONTEXT:\n{ctx}"},
    ]
    if not settings.MISTRAL_API_KEY:
        raise RuntimeError("MISTRAL_API_KEY is missing. Set it in backend .env")
    headers = {
        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.MISTRAL_MODEL,
        "messages": messages,
        "temperature": settings.TEMPERATURE,
    }
    r = httpx.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=payload, timeout=60)
    r.raise_for_status()
    answer = r.json()["choices"][0]["message"]["content"]
    sources = [{"label": f"[{i+1}]", "source": h[2], "score": h[1]} for i, h in enumerate(hits)]
    return answer, sources
