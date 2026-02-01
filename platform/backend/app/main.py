from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, agents, auth, chat, search, templates, tenants, transcripts
from app.config import settings
from app.database import create_tables
from app.services.seed import seed_default_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    await seed_default_data()
    yield


app = FastAPI(
    title="Lenny's Podcast Intelligence Platform",
    description="RAG-powered platform for searching and analyzing 269 episodes of Lenny's Podcast",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(transcripts.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
