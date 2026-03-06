"""
Configuración de la base de datos PostgreSQL
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Configuración de la base de datos
# CAMBIAR ESTOS VALORES según tu configuración
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:1982@localhost:5432/heladeria_db"
)

# Crear el engine de SQLAlchemy
engine = create_engine(DATABASE_URL)

# Crear la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()


# Dependencia para obtener la sesión de base de datos
def get_db():
    """
    Dependencia que proporciona una sesión de base de datos
    y la cierra automáticamente al finalizar
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
