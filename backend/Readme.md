# AI RAG Backend (FastAPI + Qdrant)

Backend pour une application RAG (Retrieval-Augmented Generation) autour de PDF : upload par API, ingestion/chunking, indexation Qdrant, recherche sémantique et chat Mistral avec citations.
Technos : **FastAPI**, **SQLModel/SQLite**, **Qdrant**, **Sentence-Transformers**, **Mistral API**.

---

## 🚀 Démarrage rapide

### Prérequis

* Python **3.12** recommandé
* **Qdrant** en local sur `http://localhost:6333` (via Docker)

```bash
# Lancer Qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest
# ou, si tu as un docker-compose.yml
# docker compose up -d
```

### 1) Cloner & venv

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\Activate.ps1
# Linux/Mac
source .venv/bin/activate

python -m pip install --upgrade pip setuptools wheel
```

### 2) Dépendances

Deux options :

**Option A (simple)**

```bash
python -m pip install fastapi==0.115.0 uvicorn[standard]==0.30.6 python-dotenv==1.0.1 sqlmodel==0.0.21 qdrant-client==1.9.2 sentence-transformers==3.0.1 httpx==0.27.0 pypdf==4.3.1 tqdm==4.66.5
```

**Option B (editable)**

* Vérifie que `pyproject.toml` inclut :

  ```toml
  [build-system]
  requires = ["setuptools>=68", "wheel"]
  build-backend = "setuptools.build_meta"

  [tool.setuptools.packages.find]
  where = ["."]
  include = ["app*"]
  exclude = ["storage*"]
  ```

```bash
python -m pip install -e .
```

### 3) Configuration (.env)

Crée `backend/.env` (sans guillemets) :

```
API_PREFIX=/api

MISTRAL_API_KEY=TA_CLE_MISTRAL
MISTRAL_MODEL=mistral-small-latest

QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=docs_rag

DB_URL=sqlite:///./rag.db
STORAGE_DIR=./storage

CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=5
TEMPERATURE=0.2
```

> ⚠️ `CHUNK_OVERLAP < CHUNK_SIZE` (ex. 150 < 800), sinon risques de boucles et OOM.

### 4) Lancer l’API

```bash
uvicorn app.main:app --reload --port 8000
```

* Santé : `GET http://localhost:8000/api/health` → `{"ok": true}`
* OpenAPI docs : `http://localhost:8000/docs`

---

## Architecture

```
backend/
├─ app/
│  ├─ main.py               # App FastAPI + CORS + routes
│  ├─ core/
│  │  ├─ config.py          # Settings (.env)
│  │  └─ qdrant.py          # Client + ensure_collection
│  ├─ models/
│  │  ├─ base.py            # SQLModel engine + init_db()
│  │  ├─ document.py        # Table Document
│  │  └─ chat.py            # Table ChatMessage
│  ├─ services/
│  │  ├─ embeddings.py      # SBERT model + encode()
│  │  ├─ vectorstore.py     # upsert/search/delete Qdrant
│  │  ├─ storage.py         # save PDF + chunking par page
│  │  └─ rag.py             # format context + appel Mistral
│  └─ routers/
│     ├─ health.py
│     ├─ documents.py       # upload/list/delete
│     └─ chat.py            # chat + history
├─ storage/                 # PDFs stockés (créé auto)
├─ .env.example
└─ pyproject.toml
```

---

## 🔌 Endpoints

Base URL : `http://localhost:8000/api`

### Health

* `GET /health` → `{ "ok": true }`

### Documents

* `GET /documents` → Liste des `Document`
* `POST /documents/upload` (multipart/form-data)

  * field `file`: **PDF**
  * sauvegarde, compte pages, **chunking stream**, **upsert Qdrant**
  * retourne `{ id, pages, filename }`
* `DELETE /documents/{doc_id}`

  * supprime vecteurs Qdrant (filtre `document_id`) + fichier + DB row

### Chat

* `POST /chat` `{ "session_id": "default", "query": "ta question" }`

  * cherche TOP\_K chunks → **Mistral** → renvoie `{ answer, sources }`
* `GET /chat/history/{session_id}` → messages historisés (user/assistant)

---

## RAG — Détails

* **Embeddings** : `sentence-transformers/all-MiniLM-L6-v2` (384D, cosine, normalisés)
* **Chunking** : par page PDF, taille `CHUNK_SIZE`, recouvrement `CHUNK_OVERLAP`, streaming (faible RAM)
* **Qdrant** : payload `{ text, source, document_id }`
  → suppression ciblée via `document_id`
* **Mistral** : `MISTRAL_MODEL` (ex. `mistral-small-latest`)
  Prompt système : “Utilise le CONTEXT, sinon dis ‘je ne sais pas’ ; cite \[1]\[2]”

---

## 🧪 Exemples cURL

Upload PDF :

```bash
curl -F "file=@./mon_doc.pdf" http://localhost:8000/api/documents/upload
```

Lister :

```bash
curl http://localhost:8000/api/documents
```

Supprimer :

```bash
curl -X DELETE http://localhost:8000/api/documents/1
```

Chat :

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"default\",\"query\":\"De quoi parle le PDF ?\"}"
```

Historique :

```bash
curl http://localhost:8000/api/chat/history/default
```

---

## Dépannage

* **401 Mistral** → vérifie `MISTRAL_API_KEY` (pas de guillemets), modèle accessible à ton compte.
* **ImportError `app.*`** → lance depuis `backend/` **ou** installe en editable.
* **OOM / MemoryError** → baisse `CHUNK_SIZE`, vérifie `CHUNK_OVERLAP < CHUNK_SIZE`, ingestion déjà **streamée**.
* **Qdrant not reachable** → conteneur lancé ? ports 6333/6334 ouverts ? `curl http://localhost:6333/collections`.
* **Install editable échoue (storage vu comme package)** → `pyproject.toml` avec
  `[tool.setuptools.packages.find] include=["app*"], exclude=["storage*"]`.