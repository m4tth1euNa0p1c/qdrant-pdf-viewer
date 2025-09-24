from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.qdrant import ensure_collection
from .models.base import init_db
from .routers import chat, documents, health


def create_app() -> FastAPI:
    app = FastAPI(title="AI RAG Backend", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix=settings.API_PREFIX)
    app.include_router(documents.router, prefix=settings.API_PREFIX)
    app.include_router(chat.router, prefix=settings.API_PREFIX)

    return app


app = create_app()


@app.on_event("startup")
async def startup_event() -> None:
    init_db()
    ensure_collection()
