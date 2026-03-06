"""
Router para endpoints de productos
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Producto, ProductoCreate, ProductoUpdate, ProductoConStock, MessageResponse, StockBajoResponse
from services import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.post("/", response_model=Producto, status_code=201)
async def crear_producto(producto: ProductoCreate):
    """
    Crea un nuevo producto con inventario inicial en 0
    """
    try:
        nuevo_producto = ProductoService.crear_producto(producto)
        return nuevo_producto
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[ProductoConStock])
async def listar_productos(
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    activo: Optional[bool] = Query(None, description="Filtrar por productos activos/inactivos"),
    con_stock: bool = Query(True, description="Incluir información de stock")
):
    """
    Lista todos los productos con filtros opcionales
    """
    try:
        productos = ProductoService.obtener_productos(
            categoria_id=categoria_id,
            activo=activo,
            con_stock=con_stock
        )
        return productos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stock-bajo", response_model=List[StockBajoResponse])
async def productos_stock_bajo(
    limite: Optional[int] = Query(None, description="Cantidad máxima de resultados")
):
    """
    Obtiene productos con stock bajo o crítico
    """
    try:
        productos = ProductoService.productos_stock_bajo(limite=limite)
        return productos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{producto_id}", response_model=ProductoConStock)
async def obtener_producto(producto_id: int):
    """
    Obtiene un producto específico por ID
    """
    try:
        producto = ProductoService.obtener_producto(producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{producto_id}", response_model=Producto)
async def actualizar_producto(producto_id: int, datos: ProductoUpdate):
    """
    Actualiza un producto existente
    """
    try:
        producto_actualizado = ProductoService.actualizar_producto(producto_id, datos)
        if not producto_actualizado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto_actualizado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{producto_id}", response_model=MessageResponse)
async def eliminar_producto(producto_id: int):
    """
    Elimina (desactiva) un producto
    """
    try:
        eliminado = ProductoService.eliminar_producto(producto_id)
        if not eliminado:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return MessageResponse(message="Producto eliminado correctamente", success=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
