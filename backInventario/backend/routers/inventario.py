"""
Router para endpoints de inventario
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Inventario, MovimientoCreate, Movimiento, MessageResponse, ReporteInventarioValor
from services import InventarioService
from decimal import Decimal

router = APIRouter(prefix="/inventario", tags=["Inventario"])


@router.get("/", response_model=List[dict])
async def obtener_inventario_completo():
    """
    Obtiene el inventario completo con información de todos los productos
    """
    try:
        inventario = InventarioService.obtener_inventario_completo()
        return inventario
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/producto/{producto_id}", response_model=dict)
async def obtener_inventario_producto(producto_id: int):
    """
    Obtiene el inventario de un producto específico
    """
    try:
        inventario = InventarioService.obtener_inventario_producto(producto_id)
        if not inventario:
            raise HTTPException(status_code=404, detail="Inventario no encontrado para este producto")
        return inventario
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/movimientos", response_model=Movimiento, status_code=201)
async def registrar_movimiento(movimiento: MovimientoCreate):
    """
    Registra un movimiento de inventario (entrada, salida o ajuste)
    Actualiza automáticamente el stock
    """
    try:
        nuevo_movimiento = InventarioService.registrar_movimiento(movimiento)
        return nuevo_movimiento
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/movimientos", response_model=List[dict])
async def obtener_movimientos(
    producto_id: Optional[int] = Query(None, description="Filtrar por producto"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (entrada/salida/ajuste)"),
    limite: int = Query(100, description="Cantidad máxima de resultados", ge=1, le=1000)
):
    """
    Obtiene el historial de movimientos de inventario
    """
    try:
        movimientos = InventarioService.obtener_movimientos(
            producto_id=producto_id,
            tipo=tipo,
            limite=limite
        )
        return movimientos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/stock-minimo/{producto_id}", response_model=Inventario)
async def actualizar_stock_minimo(
    producto_id: int,
    stock_minimo: Decimal = Query(..., description="Nuevo stock mínimo", ge=0)
):
    """
    Actualiza el stock mínimo de un producto
    """
    try:
        inventario = InventarioService.actualizar_stock_minimo(producto_id, stock_minimo)
        return inventario
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/valor-total", response_model=ReporteInventarioValor)
async def valor_total_inventario():
    """
    Calcula el valor total del inventario actual
    """
    try:
        resultado = InventarioService.valor_total_inventario()
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/mas-vendidos", response_model=List[dict])
async def productos_mas_vendidos(
    limite: int = Query(10, description="Cantidad de productos a retornar", ge=1, le=50)
):
    """
    Obtiene los productos más vendidos (basado en movimientos de salida)
    """
    try:
        productos = InventarioService.productos_mas_vendidos(limite=limite)
        return productos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
