# Lenny's Podcast Intelligence Platform

A multi-tenant SaaS platform that uses RAG (Retrieval-Augmented Generation) to make 269 episodes of Lenny's Podcast searchable, conversational, and actionable through AI agents and framework templates.

## Architecture

- **Backend**: FastAPI (Python) with SQLAlchemy async ORM
- **Database**: PostgreSQL + pgvector for vector similarity search
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Auth**: JWT tokens + bcrypt password hashing
- **RAG**: OpenAI embeddings (text-embedding-3-small) stored in pgvector
- **Multi-tenant**: Row-level isolation via `tenant_id`
- **i18n**: next-intl with English, Spanish, and French

## Features

- **Semantic Search**: Find conceptually related content across all transcripts using vector similarity
- **Keyword Search**: Traditional text search with guest filtering
- **AI Chat**: Conversational interface with context from podcast transcripts
- **AI Agents**: Specialized assistants (Research, Product Advisor, Growth Analyst, Quote Finder)
- **Framework Templates**: Pre-built templates (Pre-Mortem, Positioning Workshop, Growth Diagnostic, Strategy Check, Expert Comparison)
- **Admin Panel**: User management, tenant management, transcript ingestion
- **Multi-language**: UI available in English, Spanish, and French
- **Multi-tenant**: Organizations with role-based access (owner, admin, member)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- An OpenAI API key (for embeddings and chat)

### Setup

1. Copy the environment file:
   ```bash
   cd platform
   cp .env.example .env
   ```

2. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key
   SECRET_KEY=your-random-secret-key
   ```

3. Start all services:
   ```bash
   docker compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### First-Time Setup

1. Register an account at http://localhost:3000/register
2. The first registered user can be promoted to superadmin via the API
3. Log in to the Admin panel and run transcript ingestion
4. Start searching, chatting, and using templates

### Promoting a User to Superadmin

```bash
# Using the API directly
curl -X PATCH http://localhost:8000/api/admin/users/{user_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"is_superadmin": true}'
```

## Project Structure

```
platform/
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── scripts/init.sql        # DB extensions (vector, uuid-ossp)
│   └── app/
│       ├── main.py             # FastAPI app + lifespan
│       ├── config.py           # Settings (Pydantic)
│       ├── database.py         # SQLAlchemy async setup
│       ├── models/             # SQLAlchemy ORM models
│       │   ├── user.py         # User + auth
│       │   ├── tenant.py       # Tenant + TenantMember
│       │   ├── transcript.py   # Transcript + TranscriptChunk (w/ vector)
│       │   ├── agent.py        # Agent + AgentRun
│       │   ├── template.py     # Template (w/ variables)
│       │   └── chat.py         # ChatSession + ChatMessage
│       ├── schemas/            # Pydantic request/response schemas
│       ├── services/
│       │   ├── auth.py         # Password hashing + JWT
│       │   ├── rag.py          # Semantic search + keyword search
│       │   ├── agents.py       # Agent execution + OpenAI integration
│       │   ├── ingestion.py    # Transcript parsing + chunking
│       │   └── seed.py         # Default agents + templates
│       ├── middleware/
│       │   └── tenant.py       # Multi-tenant header extraction
│       └── api/                # Route handlers
│           ├── auth.py         # /api/auth/*
│           ├── tenants.py      # /api/tenants/*
│           ├── transcripts.py  # /api/transcripts/*
│           ├── search.py       # /api/search/*
│           ├── agents.py       # /api/agents/*
│           ├── templates.py    # /api/templates/*
│           ├── chat.py         # /api/chat/*
│           └── admin.py        # /api/admin/*
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.js          # next-intl plugin
    ├── tailwind.config.js      # Brand colors
    ├── messages/               # i18n translations
    │   ├── en.json
    │   ├── es.json
    │   └── fr.json
    └── src/
        ├── lib/
        │   ├── api.ts          # Typed API client
        │   ├── auth.ts         # Auth context + localStorage
        │   └── i18n.ts         # next-intl config
        ├── types/index.ts      # TypeScript interfaces
        ├── components/
        │   └── layout/
        │       └── Sidebar.tsx  # Navigation + locale switcher
        └── app/
            ├── layout.tsx      # Root layout + providers
            ├── page.tsx        # Landing page
            ├── login/page.tsx
            ├── register/page.tsx
            ├── dashboard/page.tsx
            ├── search/page.tsx
            ├── chat/page.tsx
            ├── agents/page.tsx
            ├── templates/page.tsx
            └── admin/page.tsx
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Get JWT token |
| `/api/auth/me` | GET | Current user info |
| `/api/tenants` | GET/POST | List/create tenants |
| `/api/transcripts` | GET | List transcripts |
| `/api/transcripts/stats` | GET | Transcript statistics |
| `/api/search/semantic` | POST | Vector similarity search |
| `/api/search/keyword` | POST | Text keyword search |
| `/api/agents` | GET/POST | List/create agents |
| `/api/agents/{id}/run` | POST | Execute an agent |
| `/api/templates` | GET/POST | List/create templates |
| `/api/templates/{id}/execute` | POST | Run a template |
| `/api/chat/sessions` | GET/POST | List/create chat sessions |
| `/api/chat/sessions/{id}/messages` | GET/POST | Get/send messages |
| `/api/admin/dashboard` | GET | Admin statistics |
| `/api/admin/users` | GET | List all users |
| `/api/admin/ingest` | POST | Trigger transcript ingestion |

## Default Agents

1. **Research Assistant** — Search across all transcripts for expert advice
2. **Product Advisor** — Product management advice using Doshi, Torres, and other frameworks
3. **Growth Analyst** — Growth strategy using Tavel, Winters, and Campbell frameworks
4. **Quote Finder** — Extract memorable quotes and insights from guests

## Default Templates

1. **Product Pre-Mortem** — Shreyas Doshi's Tigers/Paper Tigers/Elephants framework
2. **Positioning Workshop** — April Dunford's 5-step positioning framework
3. **Growth Diagnostic** — Multi-framework growth analysis (Tavel, Ellis, Winters, Campbell)
4. **Strategy Check** — Strategy evaluation using Rumelt, Chesky, Lutke, and Doshi
5. **Expert Comparison** — Compare what multiple guests say about a topic

## Development

### Running Without Docker

**Backend:**
```bash
cd platform/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd platform/frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://lenny:lennydev@localhost:5432/lennys_platform` |
| `SECRET_KEY` | JWT signing key | `change-me-in-production` |
| `OPENAI_API_KEY` | OpenAI API key for embeddings and chat | (required) |
| `TRANSCRIPT_DIR` | Path to episodes directory | `../episodes` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
