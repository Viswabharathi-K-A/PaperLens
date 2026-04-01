# 📄 PaperLens — AI-Powered Research Paper Q&A Platform

> Upload any research paper or document and ask questions in natural language. PaperLens uses Retrieval-Augmented Generation (RAG) to deliver cited, grounded answers — no hallucinations.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-blue) ![Redis](https://img.shields.io/badge/Queue-Redis%20%2B%20BullMQ-red) ![LLM](https://img.shields.io/badge/LLM-Groq%20(Llama%203)-orange) ![Docker](https://img.shields.io/badge/Infra-Docker-lightblue)

---

## 🚀 What This Project Does

PaperLens is a full-stack RAG (Retrieval-Augmented Generation) platform that allows users to:

- Upload PDF research papers or documents
- Ask natural language questions about the content
- Receive AI-generated answers with inline source citations
- View which document chunks the answer was derived from

The system prevents LLM hallucinations by constraining the model to only answer from retrieved document chunks — if the answer isn't in the document, it says so.

---

## ✨ Key Features

- **Drag & Drop PDF Upload** — intuitive file upload with real-time status tracking
- **Semantic Search** — vector similarity search using `all-MiniLM-L6-v2` embeddings
- **Cited Answers** — every answer includes `[Source N]` inline citations with relevance scores
- **Async Indexing** — large PDFs are processed in the background via Redis queues, keeping the UI instantly responsive
- **Chat Interface** — conversational Q&A with message history and auto-scroll
- **Document Management** — list all uploaded documents with indexing status indicators

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      React Frontend                      │
│         Upload Zone │ Document List │ Chat Panel         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (axios)
┌──────────────────────────▼──────────────────────────────┐
│                   Node.js + Express API                   │
│         /api/documents    │    /api/query                 │
└────────────┬──────────────┴──────────────┬──────────────┘
             │                             │
    ┌────────▼────────┐          ┌─────────▼─────────┐
    │   Redis Queue   │          │  Retriever Service │
    │   (BullMQ)      │          │  Vector Search     │
    └────────┬────────┘          └─────────┬─────────┘
             │                             │
    ┌────────▼────────┐          ┌─────────▼─────────┐
    │  Indexer Worker │          │   Groq LLM API    │
    │  PDF → Chunks   │          │  llama-3.1-8b     │
    │  → Embeddings   │          └───────────────────┘
    │  → PostgreSQL   │
    └────────┬────────┘
             │
    ┌────────▼────────────────────────┐
    │         PostgreSQL + pgvector    │
    │   documents table │ chunks table │
    │   IVFFlat vector index           │
    │   GIN full-text index            │
    └──────────────────────────────────┘
```

---

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite + TailwindCSS | User interface |
| **API Server** | Node.js + Express | REST API, request routing |
| **Queue** | BullMQ + Redis | Async background job processing |
| **Embeddings** | HuggingFace Inference API (`all-MiniLM-L6-v2`) | Convert text to 384-dim vectors |
| **LLM** | Groq API (`llama-3.1-8b-instant`) | Generate cited answers |
| **Vector DB** | PostgreSQL + pgvector | Store and search document vectors |
| **PDF Parsing** | pdfreader (Node.js) | Extract text from PDF files |
| **Containerization** | Docker + Docker Compose | Consistent local development |

---

## 🔄 How It Works

### Document Indexing Pipeline (one-time per upload)

```
User uploads PDF
      ↓
Express saves file → inserts DB record (status: pending)
      ↓
Job added to Redis queue (BullMQ)
      ↓  [background worker picks up job]
PDF text extracted with pdfreader
      ↓
Text split into 500-word chunks with 50-word overlap
      ↓
Each chunk embedded via HuggingFace API → 384-dim vector
      ↓
Chunks + vectors inserted into PostgreSQL (chunks table)
      ↓
Document status updated to "ready"
```

### Query Pipeline (every question)

```
User types a question
      ↓
Question embedded via HuggingFace API → query vector
      ↓
pgvector cosine similarity search → top 5 relevant chunks
      ↓
Chunks + question sent to Groq (llama-3.1-8b-instant)
      ↓
LLM generates answer using ONLY retrieved chunks
      ↓
Answer with [Source N] citations returned to UI
```

---

## 📁 Project Structure

```
PaperLens/
├── docker-compose.yml          # PostgreSQL + Redis services
├── .gitignore
├── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.jsx  # Drag & drop PDF upload
│   │   │   ├── DocList.jsx     # Document list with status
│   │   │   └── ChatPanel.jsx   # Chat interface + citations
│   │   ├── api.js              # Axios API helper
│   │   └── App.jsx             # Root component
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── routes/
    │   │   ├── documents.js    # Upload, list documents
    │   │   └── query.js        # RAG query endpoint
    │   ├── services/
    │   │   ├── pdfParser.js    # PDF parsing + chunking
    │   │   ├── embedder.js     # HuggingFace embeddings
    │   │   ├── retriever.js    # Vector similarity search
    │   │   └── llm.js          # Groq LLM integration
    │   ├── workers/
    │   │   └── indexer.js      # Background indexing worker
    │   ├── db/
    │   │   ├── client.js       # PostgreSQL connection pool
    │   │   └── schema.sql      # Database schema
    │   └── server.js           # Express app entry point
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Groq API Key](https://console.groq.com) (free)
- [HuggingFace API Key](https://huggingface.co/settings/tokens) (free)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/PaperLens.git
cd PaperLens
```

### 2. Set up environment variables

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
HF_API_KEY=your_huggingface_api_key_here
PORT=3001
UPLOADS_DIR=./uploads
DATABASE_URL=postgres://paperlensuser:paperlenspass@127.0.0.1:5432/paperlensdb
REDIS_URL=redis://127.0.0.1:6379
```

### 3. Start the database and Redis

```bash
docker-compose up -d
```

### 4. Install and start the backend

```bash
cd backend
npm install
mkdir uploads
node src/server.js        # Terminal 1 — API server
node src/workers/indexer.js  # Terminal 2 — Background worker
```

### 5. Install and start the frontend

```bash
cd frontend
npm install
npm run dev               # Terminal 3 — React dev server
```

### 6. Open the app

Navigate to `http://localhost:5173` in your browser.

---

## 🗄️ Database Schema

```sql
-- Tracks uploaded documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | indexing | ready | error
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores document chunks with vector embeddings
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384),          -- all-MiniLM-L6-v2 dimensions
  chunk_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast vector similarity search
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);

-- GIN index for full-text keyword search
CREATE INDEX ON chunks USING GIN (to_tsvector('english', content));
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/upload` | Upload a PDF file |
| `GET` | `/api/documents` | List all uploaded documents |
| `POST` | `/api/query` | Ask a question about a document |

### Example Query Request

```json
POST /api/query
{
  "question": "What is an RDD?",
  "documentId": "4cb8a4e4-175d-464d-ac4f-004c2b2fbe6a"
}
```

### Example Query Response

```json
{
  "question": "What is an RDD?",
  "answer": "An RDD (Resilient Distributed Dataset) is a fundamental data structure in Apache Spark [Source 1]. It is a fault-tolerant collection of elements that can be processed in parallel across a cluster.",
  "sources": [
    { "content": "RDDs do not need to be materialized at all times...", "score": 0.51 },
    { "content": "RDDs can be recovered using lineage...", "score": 0.47 }
  ]
}
```

---

## 🧠 Design Decisions

**Why pgvector instead of Pinecone?**
Keeping vectors in PostgreSQL alongside structured data simplifies the architecture — one database for everything. pgvector with IVFFlat handles millions of vectors efficiently. For most portfolio and production use cases, this reduces operational complexity significantly.

**Why chunk at 500 words with 50-word overlap?**
Smaller chunks (100 words) have higher retrieval precision but lose context — a sentence mid-argument loses meaning without surrounding sentences. Larger chunks (1000 words) preserve context but reduce retrieval precision. 500 words with 50-word overlap is an empirically proven starting point that balances both concerns.

**Why async indexing with Redis?**
PDF processing (parsing, chunking, embedding API calls) can take 30-60 seconds for large documents. Doing this synchronously would block the HTTP response and cause timeouts. The queue makes uploads feel instant — the UI responds immediately while processing happens in the background.

**Why Groq instead of OpenAI?**
Groq provides a free tier with extremely fast inference on open-source models (llama-3.1-8b-instant). For a project of this scale, it delivers comparable quality at zero cost, making it ideal for development and portfolios.

---

## 👨‍💻 Author

Built by **[Viswabharathi]** — [LinkedIn]([https://linkedin.com/in/yourprofile](https://www.linkedin.com/in/viswabharathi-k-a-b797391a1/)) · [GitHub](https://github.com/Viswabharathi-K-A)

---

## 📄 License

MIT License — feel free to use this project as a reference or starting point.
