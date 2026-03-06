"""
Módulo de conexión a la base de datos PostgreSQL
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Generator
from config import get_settings

settings = get_settings()


class DatabaseConnection:
    """Maneja la conexión a PostgreSQL"""
    
    @staticmethod
    def get_connection():
        """Crea una nueva conexión a la base de datos"""
        try:
            conn = psycopg2.connect(
                host=settings.db_host,
                port=settings.db_port,
                dbname=settings.db_name,
                user=settings.db_user,
                password=settings.db_password,
                cursor_factory=RealDictCursor  # Devuelve diccionarios en lugar de tuplas
            )
            return conn
        except Exception as e:
            raise Exception(f"Error conectando a la base de datos: {str(e)}")
    
    @staticmethod
    @contextmanager
    def get_cursor() -> Generator:
        """
        Context manager para obtener un cursor
        Uso: with DatabaseConnection.get_cursor() as cursor:
        """
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()


def test_connection():
    """Prueba la conexión a la base de datos"""
    try:
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✓ Conexión exitosa a PostgreSQL")
            print(f"  Versión: {version['version']}")
            return True
    except Exception as e:
        print(f"✗ Error de conexión: {str(e)}")
        return False


if __name__ == "__main__":
    test_connection()
