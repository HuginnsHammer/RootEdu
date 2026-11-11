from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "RootEdu API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    tenant_id: str = "must_main"
    institution_name: str = "Meru University of Science and Technology"
    allowed_email_domains: list[str] = Field(default_factory=lambda: ["students.must.ac.ke"])
    registration_prefixes: list[str] = Field(default_factory=lambda: ["CT206", "CT204", "CT201"])
    programme_catalog: dict[str, str] = Field(
        default_factory=lambda: {
            "CT206": "Bachelor of Computer Security and Forensics",
            "CT204": "Bachelor of Computer Technology",
            "CT201": "Bachelor of Computer Science",
        }
    )
    database_url: str = "postgresql+psycopg://rootedu:rootedu_dev_only@localhost:5432/rootedu"
    redis_url: str = "redis://localhost:6379/0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
