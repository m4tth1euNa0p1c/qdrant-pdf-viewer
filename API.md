# 📡 API Documentation - AI RAG PDF

Documentation complète de l'API REST pour l'application AI RAG PDF. Tous les endpoints sont préfixés par `/api` et retournent du JSON.

## 📋 Table des Matières

- [🔧 Configuration](#-configuration)
- [🏥 Health Check](#-health-check)
- [📄 Documents Management](#-documents-management)
- [💬 Chat & RAG](#-chat--rag)
- [🔍 Modèles de Données](#-modèles-de-données)
- [❌ Gestion d'Erreurs](#-gestion-derreurs)
- [🧪 Exemples Pratiques](#-exemples-pratiques)

---

## 🔧 Configuration

### Base URL
```
http://localhost:8000/api
```

### Headers Requis
```http
Content-Type: application/json
Accept: application/json
```

### Format de Réponse Standard
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🏥 Health Check

### GET /health

Vérification de l'état de santé de l'API et de ses dépendances.

**Réponse :**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "qdrant": "connected",
    "mistral": "available",
    "storage": "accessible"
  },
  "uptime": 3600,
  "memory_usage": "145MB",
  "active_sessions": 12
}
```

**Codes de Statut :**
- `200` : Tous les services fonctionnent
- `503` : Un ou plusieurs services indisponibles

---

## 📄 Documents Management

### GET /documents

Récupère la liste de tous les documents indexés.

**Paramètres de Requête :**
- `limit` (optionnel) : Nombre max de résultats (défaut: 50, max: 100)
- `offset` (optionnel) : Nombre de résultats à ignorer (défaut: 0)
- `search` (optionnel) : Recherche par nom de fichier

**Exemple Requête :**
```http
GET /api/documents?limit=20&offset=0&search=rapport
```

**Réponse :**
```json
{
  "documents": [
    {
      "id": 1,
      "filename": "rapport_annuel_2023.pdf",
      "original_name": "Rapport Annuel 2023.pdf",
      "content_type": "application/pdf",
      "bytes_size": 2458936,
      "pages": 45,
      "created_at": "2024-01-15T10:30:00Z",
      "chunks_count": 89,
      "embeddings_generated": true,
      "processing_status": "completed"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0,
  "has_more": false
}
```

---

### POST /documents/upload

Upload et traitement d'un nouveau document PDF.

**Content-Type :** `multipart/form-data`

**Paramètres :**
- `file` (requis) : Fichier PDF (max 50MB)

**Exemple Requête :**
```bash
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf" \
  http://localhost:8000/api/documents/upload
```

**Réponse Success :**
```json
{
  "document": {
    "id": 2,
    "filename": "doc_1642251600.pdf",
    "original_name": "document.pdf",
    "content_type": "application/pdf",
    "bytes_size": 1024000,
    "pages": 12,
    "created_at": "2024-01-15T10:35:00Z",
    "processing_status": "processing"
  },
  "message": "Document uploaded successfully. Processing started.",
  "estimated_completion": "2024-01-15T10:37:00Z"
}
```

**Codes de Statut :**
- `201` : Document uploadé avec succès
- `400` : Fichier invalide ou trop volumineux
- `415` : Type de fichier non supporté
- `507` : Espace de stockage insuffisant

**Pipeline de Traitement :**
1. **Upload** → Validation format et taille
2. **Storage** → Sauvegarde dans `./storage/`
3. **Extraction** → PyPDF pour extraire le texte
4. **Chunking** → Découpage intelligent (800 chars, overlap 150)
5. **Embeddings** → Sentence Transformers (all-MiniLM-L6-v2)
6. **Indexation** → Stockage dans Qdrant
7. **Completion** → Document prêt pour le RAG

---

### GET /documents/{document_id}

Récupère les détails d'un document spécifique.

**Paramètres de Chemin :**
- `document_id` (requis) : ID unique du document

**Réponse :**
```json
{
  "document": {
    "id": 1,
    "filename": "rapport_annuel_2023.pdf",
    "original_name": "Rapport Annuel 2023.pdf",
    "content_type": "application/pdf",
    "bytes_size": 2458936,
    "pages": 45,
    "created_at": "2024-01-15T10:30:00Z",
    "chunks_count": 89,
    "embeddings_generated": true,
    "processing_status": "completed",
    "metadata": {
      "title": "Rapport Annuel 2023",
      "author": "Company Name",
      "subject": "Financial Report",
      "creation_date": "2023-12-31T23:59:59Z"
    },
    "chunks": [
      {
        "id": "chunk_1_0",
        "content": "Résumé exécutif du rapport annuel...",
        "page": 1,
        "position": 0,
        "embedding_vector": null
      }
    ]
  }
}
```

---

### DELETE /documents/{document_id}

Supprime un document et tous ses embeddings associés.

**Paramètres de Chemin :**
- `document_id` (requis) : ID unique du document

**Réponse :**
```json
{
  "message": "Document and all associated data deleted successfully",
  "deleted": {
    "document_id": 1,
    "chunks_deleted": 89,
    "vectors_deleted": 89,
    "storage_freed": "2.4MB"
  }
}
```

**Codes de Statut :**
- `200` : Document supprimé avec succès
- `404` : Document non trouvé
- `409` : Document en cours de traitement (suppression refusée)

---

## 💬 Chat & RAG

### POST /chat

Endpoint principal pour les interactions chat avec RAG.

**Body :**
```json
{
  "query": "Quels sont les principaux indicateurs financiers de 2023 ?",
  "session_id": "user_session_123",
  "options": {
    "top_k": 5,
    "temperature": 0.2,
    "max_tokens": 1000,
    "include_sources": true,
    "context_window": 3
  }
}
```

**Paramètres :**
- `query` (requis) : Question de l'utilisateur
- `session_id` (optionnel) : ID de session pour l'historique (défaut: "default")
- `options` (optionnel) : Configuration du RAG

**Pipeline RAG Détaillé :**

1. **Query Processing**
   ```python
   # Normalisation et enrichissement de la requête
   normalized_query = preprocess_query(query)
   query_embedding = embedding_model.encode(normalized_query)
   ```

2. **Vector Search**
   ```python
   # Recherche dans Qdrant
   search_results = qdrant_client.search(
       collection_name=COLLECTION,
       query_vector=query_embedding,
       limit=top_k,
       score_threshold=0.3
   )
   ```

3. **Context Building**
   ```python
   # Construction du contexte avec les chunks pertinents
   context = build_context(search_results, context_window)
   ```

4. **LLM Generation**
   ```python
   # Génération avec Mistral
   prompt = f"""
   Contexte: {context}
   Question: {query}
   Instructions: Réponds uniquement basé sur le contexte fourni...
   """
   response = mistral_client.chat(prompt, temperature=temperature)
   ```

**Réponse Success :**
```json
{
  "answer": "Selon les documents analysés, les principaux indicateurs financiers de 2023 sont :\n\n1. **Chiffre d'affaires** : 45,2M€ (+12% vs 2022)\n2. **Résultat net** : 3,8M€ (+8% vs 2022)\n3. **EBITDA** : 8,1M€ (marge de 17,9%)\n\nCes résultats témoignent d'une croissance solide malgré le contexte économique difficile.",

  "sources": [
    {
      "document_id": 1,
      "document_name": "rapport_annuel_2023.pdf",
      "chunk_id": "chunk_1_15",
      "content": "Le chiffre d'affaires consolidé s'élève à 45,2 millions d'euros, en progression de 12% par rapport à l'exercice précédent...",
      "page": 8,
      "score": 0.89,
      "relevance": "high"
    },
    {
      "document_id": 1,
      "document_name": "rapport_annuel_2023.pdf",
      "chunk_id": "chunk_1_23",
      "content": "Le résultat net ressort à 3,8 millions d'euros contre 3,5 millions en 2022, soit une hausse de 8%...",
      "page": 12,
      "score": 0.85,
      "relevance": "high"
    }
  ],

  "metadata": {
    "response_time_ms": 1247,
    "tokens_used": {
      "input": 1250,
      "output": 180
    },
    "model_used": "mistral-small-latest",
    "search_results_count": 5,
    "sources_included": 2,
    "session_id": "user_session_123"
  },

  "debug_info": {
    "query_embedding_time_ms": 45,
    "vector_search_time_ms": 89,
    "llm_generation_time_ms": 1113,
    "context_length": 2048,
    "confidence_score": 0.87
  }
}
```

**Codes de Statut :**
- `200` : Réponse générée avec succès
- `400` : Query manquante ou invalide
- `404` : Aucun document indexé
- `429` : Limite de taux dépassée
- `503` : Service Mistral indisponible

---

### GET /chat/history/{session_id}

Récupère l'historique de conversation d'une session.

**Paramètres de Chemin :**
- `session_id` (requis) : ID de la session

**Paramètres de Requête :**
- `limit` (optionnel) : Nombre d'échanges (défaut: 50)
- `offset` (optionnel) : Décalage (défaut: 0)

**Réponse :**
```json
{
  "session_id": "user_session_123",
  "messages": [
    {
      "id": 1,
      "type": "user",
      "content": "Quels sont les principaux indicateurs financiers ?",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "type": "assistant",
      "content": "Selon les documents analysés, les principaux indicateurs...",
      "sources": [
        {
          "document_name": "rapport_annuel_2023.pdf",
          "page": 8,
          "score": 0.89
        }
      ],
      "timestamp": "2024-01-15T10:30:02Z",
      "metadata": {
        "response_time_ms": 1247,
        "tokens_used": 180
      }
    }
  ],
  "total": 2,
  "session_started": "2024-01-15T10:30:00Z",
  "last_activity": "2024-01-15T10:30:02Z"
}
```

---

### DELETE /chat/history/{session_id}

Supprime l'historique d'une session.

**Réponse :**
```json
{
  "message": "Chat history cleared successfully",
  "session_id": "user_session_123",
  "messages_deleted": 24
}
```

---

## 🔍 Modèles de Données

### Document
```typescript
interface Document {
  id: number;                    // ID unique auto-généré
  filename: string;              // Nom de fichier système (unique)
  original_name: string;         // Nom de fichier original
  content_type: string;          // MIME type (toujours "application/pdf")
  bytes_size: number;            // Taille en octets
  pages: number;                 // Nombre de pages extraites
  created_at: string;            // Date de création (ISO 8601)
  chunks_count?: number;         // Nombre de chunks générés
  embeddings_generated?: boolean; // Statut des embeddings
  processing_status?: ProcessingStatus; // Statut du traitement
}

type ProcessingStatus = "pending" | "processing" | "completed" | "failed";
```

### ChatMessage
```typescript
interface ChatMessage {
  id?: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: Source[];
  metadata?: MessageMetadata;
}

interface MessageMetadata {
  response_time_ms?: number;
  tokens_used?: number;
  model_used?: string;
  confidence_score?: number;
}
```

### Source
```typescript
interface Source {
  document_id: number;
  document_name: string;
  chunk_id: string;
  content: string;
  page: number;
  score: number;              // Score de similarité (0-1)
  relevance: "low" | "medium" | "high";
}
```

### RAGOptions
```typescript
interface RAGOptions {
  top_k?: number;             // Nombre de chunks à récupérer (1-20, défaut: 5)
  temperature?: number;       // Créativité du modèle (0-1, défaut: 0.2)
  max_tokens?: number;        // Longueur max réponse (100-2000, défaut: 1000)
  include_sources?: boolean;  // Inclure les sources (défaut: true)
  context_window?: number;    // Contexte additionnel (0-5, défaut: 3)
  score_threshold?: number;   // Seuil de pertinence (0-1, défaut: 0.3)
}
```

---

## ❌ Gestion d'Erreurs

### Format Standard des Erreurs
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The uploaded file is not a valid PDF document",
    "details": {
      "field": "file",
      "received_type": "text/plain",
      "expected_type": "application/pdf"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123def456"
  }
}
```

### Codes d'Erreur Spécifiques

#### Documents
- `DOC_NOT_FOUND` : Document inexistant
- `DOC_PROCESSING` : Document en cours de traitement
- `INVALID_FILE_TYPE` : Type de fichier non supporté
- `FILE_TOO_LARGE` : Fichier dépassant la limite de taille
- `STORAGE_FULL` : Espace de stockage insuffisant
- `EXTRACTION_FAILED` : Échec de l'extraction de texte

#### Chat & RAG
- `EMPTY_QUERY` : Requête vide ou trop courte
- `NO_DOCUMENTS` : Aucun document indexé
- `MISTRAL_UNAVAILABLE` : Service Mistral indisponible
- `QDRANT_ERROR` : Erreur base vectorielle
- `RATE_LIMITED` : Limite de taux API dépassée
- `CONTEXT_TOO_LARGE` : Contexte dépassant les limites

#### Système
- `DATABASE_ERROR` : Erreur base de données
- `INTERNAL_ERROR` : Erreur serveur interne
- `SERVICE_UNAVAILABLE` : Service temporairement indisponible

---

## 🧪 Exemples Pratiques

### Workflow Complet : Upload → Chat

**1. Upload d'un Document :**
```bash
curl -X POST \
  -F "file=@manuel_utilisateur.pdf" \
  http://localhost:8000/api/documents/upload

# Réponse
{
  "document": {
    "id": 3,
    "processing_status": "processing"
  }
}
```

**2. Vérification du Statut :**
```bash
curl http://localhost:8000/api/documents/3

# Réponse après traitement
{
  "document": {
    "id": 3,
    "processing_status": "completed",
    "chunks_count": 156
  }
}
```

**3. Chat avec le Document :**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Comment installer le logiciel ?",
    "session_id": "user_demo"
  }' \
  http://localhost:8000/api/chat

# Réponse
{
  "answer": "Pour installer le logiciel, suivez ces étapes...",
  "sources": [...]
}
```

### Configuration RAG Avancée

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyse détaillée des performances financières",
    "session_id": "analysis_session",
    "options": {
      "top_k": 10,
      "temperature": 0.1,
      "max_tokens": 1500,
      "context_window": 5,
      "score_threshold": 0.4
    }
  }' \
  http://localhost:8000/api/chat
```

### Gestion de Session

```bash
# Démarrer une session
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Bonjour", "session_id": "session_456"}' \
  http://localhost:8000/api/chat

# Continuer la conversation
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Peux-tu détailler ce point ?", "session_id": "session_456"}' \
  http://localhost:8000/api/chat

# Récupérer l'historique
curl http://localhost:8000/api/chat/history/session_456

# Nettoyer la session
curl -X DELETE http://localhost:8000/api/chat/history/session_456
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement

```bash
# RAG Tuning
CHUNK_SIZE=800              # Taille des chunks (400-1200)
CHUNK_OVERLAP=150          # Chevauchement (50-300)
TOP_K=5                    # Résultats par défaut (1-20)
TEMPERATURE=0.2            # Créativité (0.0-1.0)

# Performance
MAX_FILE_SIZE=52428800     # 50MB en octets
MAX_CONCURRENT_UPLOADS=3   # Uploads simultanés
EMBEDDING_BATCH_SIZE=32    # Traitement par lot
CACHE_TTL=3600            # Cache embeddings (secondes)

# Limites API
RATE_LIMIT_PER_MINUTE=60  # Requêtes par minute
MAX_SESSION_HISTORY=100   # Messages par session
SESSION_TIMEOUT=7200      # Timeout session (secondes)
```

### Monitoring et Métriques

```bash
# Statistiques système
curl http://localhost:8000/api/health

# Métriques détaillées
curl http://localhost:8000/api/metrics

# Logs en temps réel
curl http://localhost:8000/api/logs?level=info&limit=100
```

---

## 🚀 Performance et Optimisation

### Recommandations

**Documents :**
- Taille optimale : 1-10MB par PDF
- Pages : 1-100 pages pour de meilleures performances
- Format : PDF natif (éviter les scans non-OCR)

**RAG :**
- `top_k=3-7` pour équilibre pertinence/vitesse
- `temperature=0.0-0.3` pour réponses factuelles
- `chunk_size=600-1000` selon densité du contenu

**Caching :**
- Embeddings cachés 1h par défaut
- Réponses similaires cachées 15min
- Sessions maintenues 2h sans activité

### Limites Système

| Ressource | Limite | Configurable |
|-----------|---------|---------------|
| Taille fichier | 50MB | ✅ MAX_FILE_SIZE |
| Documents simultanés | 1000 | ❌ SQLite limite |
| Requêtes/minute | 60 | ✅ RATE_LIMIT |
| Longueur requête | 2000 chars | ✅ MAX_QUERY_LENGTH |
| Historique session | 100 messages | ✅ MAX_SESSION_HISTORY |

---

## 🔐 Authentification (Futur)

*Note: L'authentification n'est pas encore implémentée dans cette version.*

### Prévision API Keys

```http
Authorization: Bearer your_api_key_here
X-API-Key: your_api_key_here
```

### Prévision Scopes

- `documents:read` : Lecture des documents
- `documents:write` : Upload/suppression documents
- `chat:use` : Utilisation du chat RAG
- `admin:all` : Administration complète

---

Cette documentation couvre l'ensemble des fonctionnalités de l'API AI RAG PDF. Pour des questions spécifiques ou des cas d'usage avancés, consultez les [exemples dans le repository](./examples/) ou créez une [issue GitHub](https://github.com/votre-username/ai-rag-pdf/issues).