"""
Paquete de routers
"""

from .productos import router as productos_router
from .inventario import router as inventario_router
from .ventas import router as ventas_router

__all__ = ['productos_router', 'inventario_router', 'ventas_router']
