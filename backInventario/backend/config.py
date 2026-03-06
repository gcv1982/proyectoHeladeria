"""
Configuración de la aplicación
Maneja variables de entorno y settings
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Base de datos
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "heladeria_db"
    db_user: str = "postgres"
    db_password: str = ""
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_title: str = "API Heladería"
    api_version: str = "1.0.0"
    api_description: str = "API REST para gestión de heladería - Inventario, Ventas y Reportes"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def database_url(self) -> str:
        """Construye la URL de conexión a PostgreSQL"""
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


@lru_cache()
def get_settings() -> Settings:
    """Obtiene la instancia de settings (cached)"""
    return Settings()
