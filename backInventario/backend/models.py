"""
Modelos Pydantic para validación y serialización de datos
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ============================================
# MODELOS DE PRODUCTOS
# ============================================

class ProductoBase(BaseModel):
    """Modelo base de producto"""
    nombre: str = Field(..., min_length=1, max_length=200)
    categoria_id: int
    unidad_medida: str = Field(..., pattern="^(kg|litro|unidad)$")
    precio_actual: Decimal = Field(..., ge=0)
    costo_unitario: Decimal = Field(default=0, ge=0)
    activo: bool = True


class ProductoCreate(ProductoBase):
    """Modelo para crear un producto"""
    pass


class ProductoUpdate(BaseModel):
    """Modelo para actualizar un producto"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    categoria_id: Optional[int] = None
    precio_actual: Optional[Decimal] = Field(None, ge=0)
    costo_unitario: Optional[Decimal] = Field(None, ge=0)
    activo: Optional[bool] = None


class Producto(ProductoBase):
    """Modelo completo de producto"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProductoConStock(Producto):
    """Producto con información de stock"""
    stock_actual: Optional[Decimal] = 0
    stock_minimo: Optional[Decimal] = 0
    estado_stock: Optional[str] = "OK"


# ============================================
# MODELOS DE INVENTARIO
# ============================================

class InventarioBase(BaseModel):
    """Modelo base de inventario"""
    producto_id: int
    stock_actual: Decimal = Field(..., ge=0)
    stock_minimo: Decimal = Field(default=5, ge=0)


class InventarioUpdate(BaseModel):
    """Modelo para actualizar inventario"""
    stock_actual: Optional[Decimal] = Field(None, ge=0)
    stock_minimo: Optional[Decimal] = Field(None, ge=0)


class Inventario(InventarioBase):
    """Modelo completo de inventario"""
    id: int
    ultima_actualizacion: datetime
    
    class Config:
        from_attributes = True


# ============================================
# MODELOS DE MOVIMIENTOS
# ============================================

class MovimientoCreate(BaseModel):
    """Modelo para registrar un movimiento de inventario"""
    producto_id: int
    tipo: str = Field(..., pattern="^(entrada|salida|ajuste)$")
    cantidad: Decimal = Field(..., gt=0)
    observacion: Optional[str] = None
    usuario: Optional[str] = None


class Movimiento(MovimientoCreate):
    """Modelo completo de movimiento"""
    id: int
    stock_anterior: Decimal
    stock_nuevo: Decimal
    fecha: datetime
    
    class Config:
        from_attributes = True


# ============================================
# MODELOS DE VENTAS
# ============================================

class VentaCreate(BaseModel):
    """Modelo para registrar una venta"""
    producto_id: int
    cantidad_vendida: Decimal = Field(..., gt=0)
    precio_venta: Decimal = Field(..., gt=0)
    fecha: Optional[date] = None


class Venta(VentaCreate):
    """Modelo completo de venta"""
    id: int
    total: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True


class VentaDiariaResumen(BaseModel):
    """Resumen de ventas del día"""
    fecha: date
    total_ventas: Decimal
    total_productos_vendidos: Decimal
    cantidad_transacciones: int


# ============================================
# MODELOS DE CATEGORÍAS
# ============================================

class CategoriaBase(BaseModel):
    """Modelo base de categoría"""
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = None
    activo: bool = True


class Categoria(CategoriaBase):
    """Modelo completo de categoría"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# MODELOS DE RESPUESTA
# ============================================

class MessageResponse(BaseModel):
    """Respuesta genérica con mensaje"""
    message: str
    success: bool = True


class StockBajoResponse(BaseModel):
    """Respuesta para productos con stock bajo"""
    id: int
    nombre: str
    categoria: str
    stock_actual: Decimal
    stock_minimo: Decimal
    estado: str


class ReporteVentasProducto(BaseModel):
    """Reporte de ventas por producto"""
    producto_id: int
    nombre_producto: str
    categoria: str
    cantidad_vendida: Decimal
    total_ingresos: Decimal
    cantidad_transacciones: int


class ReporteInventarioValor(BaseModel):
    """Reporte del valor del inventario"""
    total_productos: int
    valor_total_inventario: Decimal
    productos_activos: int
    productos_sin_stock: int
