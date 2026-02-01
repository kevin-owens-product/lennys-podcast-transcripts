from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://lenny:lennydev@localhost:5432/lennys_platform"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    transcript_dir: str = "/data/episodes"
    cors_origins: str = "http://localhost:3000"
    chunk_size: int = 800
    chunk_overlap: int = 200
    default_locale: str = "en"
    supported_locales: str = "en,es,fr,de,ja,pt"

    model_config = {"env_file": ".env"}


settings = Settings()
