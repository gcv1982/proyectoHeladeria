"""
Router para endpoints de ventas
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import VentaCreate, Venta, VentaDiariaResumen, ReporteVentasProducto
from services import VentaService
from datetime import date

router = APIRouter(prefix="/ventas", tags=["Ventas"])


@router.post("/", response_model=Venta, status_code=201)
async def registrar_venta(venta: VentaCreate):
    """
    Registra una venta y descuenta automáticamente del inventario
    """
    try:
        nueva_venta = VentaService.registrar_venta(venta)
        return nueva_venta
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/masivas", response_model=dict, status_code=201)
async def registrar_ventas_masivas(ventas: List[VentaCreate]):
    """
    Registra múltiples ventas en una sola transacción
    """
    try:
        resultado = VentaService.registrar_ventas_masivas(ventas)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[dict])
async def obtener_ventas(
    fecha_desde: Optional[date] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    fecha_hasta: Optional[date] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    producto_id: Optional[int] = Query(None, description="Filtrar por producto"),
    limite: int = Query(100, description="Cantidad máxima de resultados", ge=1, le=1000)
):
    """
    Obtiene listado de ventas con filtros opcionales
    """
    try:
        ventas = VentaService.obtener_ventas(
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            producto_id=producto_id,
            limite=limite
        )
        return ventas
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/resumen-dia", response_model=VentaDiariaResumen)
async def resumen_ventas_dia(
    fecha: Optional[date] = Query(None, description="Fecha (YYYY-MM-DD). Default: hoy")
):
    """
    Obtiene resumen de ventas de un día específico
    """
    try:
        resumen = VentaService.resumen_ventas_dia(fecha=fecha)
        fecha_final = fecha or date.today()
        return {
            "fecha": fecha_final,
            "total_ventas": resumen['total_ventas'] or 0,
            "total_productos_vendidos": resumen['total_productos_vendidos'] or 0,
            "cantidad_transacciones": resumen['cantidad_transacciones'] or 0
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/por-producto", response_model=List[ReporteVentasProducto])
async def ventas_por_producto(
    fecha_desde: Optional[date] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    fecha_hasta: Optional[date] = Query(None, description="Fecha hasta (YYYY-MM-DD)")
):
    """
    Obtiene resumen de ventas agrupado por producto
    """
    try:
        ventas = VentaService.ventas_por_producto(
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta
        )
        return ventas
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/por-categoria", response_model=List[dict])
async def ventas_por_categoria(
    fecha_desde: Optional[date] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    fecha_hasta: Optional[date] = Query(None, description="Fecha hasta (YYYY-MM-DD)")
):
    """
    Obtiene resumen de ventas agrupado por categoría
    """
    try:
        ventas = VentaService.ventas_por_categoria(
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta
        )
        return ventas
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/top-productos", response_model=List[dict])
async def top_productos_vendidos(
    limite: int = Query(10, description="Cantidad de productos a retornar", ge=1, le=50),
    dias: int = Query(30, description="Últimos N días", ge=1, le=365)
):
    """
    Obtiene los productos más vendidos en los últimos N días
    """
    try:
        productos = VentaService.top_productos_vendidos(limite=limite, dias=dias)
        return productos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
