import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    # 应用
    APP_NAME: str = "Steel Carbon AI Agent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # LLM配置
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_BASE_URL: Optional[str] = None

    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017/carbon_knowledge"

    # 业务服务
    CARBON_SERVICE_URL: str = "http://localhost:3002"
    MONITOR_SERVICE_URL: str = "http://localhost:3003"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
