import os
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv(usecwd=True), override=True)


def _normalize_env_value(value: str | None) -> str:
    return (value or "").strip().strip('"').strip("'")


def _get_int_env(key: str, default: str) -> int:
    value = _normalize_env_value(os.getenv(key) or default)
    return int(value or default)


def _get_float_env(key: str, default: str) -> float:
    value = _normalize_env_value(os.getenv(key) or default)
    return float(value or default)


class Settings:
    API_PREFIX: str = _normalize_env_value(os.getenv("API_PREFIX") or "/api")

    MISTRAL_API_KEY: str = _normalize_env_value(os.getenv("MISTRAL_API_KEY"))
    MISTRAL_MODEL: str = _normalize_env_value(os.getenv("MISTRAL_MODEL") or "mistral-small-latest")

    QDRANT_URL: str = _normalize_env_value(os.getenv("QDRANT_URL") or "http://localhost:6333")
    QDRANT_COLLECTION: str = _normalize_env_value(os.getenv("QDRANT_COLLECTION") or "docs_rag")

    DB_URL: str = _normalize_env_value(os.getenv("DB_URL") or "sqlite:///./rag.db")
    STORAGE_DIR: str = _normalize_env_value(os.getenv("STORAGE_DIR") or "./storage")

    CHUNK_SIZE: int = _get_int_env("CHUNK_SIZE", "800")
    CHUNK_OVERLAP: int = _get_int_env("CHUNK_OVERLAP", "150")
    TOP_K: int = _get_int_env("TOP_K", "5")
    TEMPERATURE: float = _get_float_env("TEMPERATURE", "0.2")


settings = Settings()
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
