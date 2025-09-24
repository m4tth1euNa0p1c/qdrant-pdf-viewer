from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from ..models.base import engine
from ..models.chat import ChatMessage
from ..services.rag import chat as rag_chat
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("")
def chat(payload: dict):
    session_id = (payload.get("session_id") or "default").strip() or "default"
    query = (payload.get("query") or "").strip()
    if not query:
        raise HTTPException(400, "Empty query")

    answer, sources = rag_chat(query)

    with Session(engine) as s:
        s.add(ChatMessage(session_id=session_id, role="user", content=query))
        s.add(ChatMessage(session_id=session_id, role="assistant",
                          content=answer, sources=json.dumps(sources, ensure_ascii=False)))
        s.commit()

    return {"answer": answer, "sources": sources}

@router.get("/history/{session_id}")
def history(session_id: str):
    with Session(engine) as s:
        msgs = s.exec(select(ChatMessage)
                      .where(ChatMessage.session_id == session_id)
                      .order_by(ChatMessage.created_at)).all()
        return msgs
