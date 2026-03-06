"""
Schemas Pydantic para validación y serialización de datos
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ============================================
# SCHEMAS DE CATEGORÍAS
# ============================================

class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class Categoria(CategoriaBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# SCHEMAS DE PRODUCTOS
# ============================================

class ProductoBase(BaseModel):
    nombre: str
    categoria_id: int
    unidad_medida: str = Field(..., pattern="^(kg|litro|unidad)$")
    precio_actual: Decimal = Field(ge=0)
    costo_unitario: Decimal = Field(ge=0, default=0)
    activo: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria_id: Optional[int] = None
    precio_actual: Optional[Decimal] = Field(None, ge=0)
    costo_unitario: Optional[Decimal] = Field(None, ge=0)
    activo: Optional[bool] = None


class Producto(ProductoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProductoConStock(Producto):
    """Producto con información de stock"""
    stock_actual: Optional[Decimal] = None
    stock_minimo: Optional[Decimal] = None
    estado_stock: Optional[str] = None
    valor_stock: Optional[Decimal] = None


# ============================================
# SCHEMAS DE INVENTARIO
# ============================================

class InventarioBase(BaseModel):
    stock_actual: Decimal = Field(ge=0)
    stock_minimo: Decimal = Field(ge=0, default=0)


class InventarioUpdate(BaseModel):
    stock_minimo: Optional[Decimal] = Field(None, ge=0)


class Inventario(InventarioBase):
    id: int
    producto_id: int
    ultima_actualizacion: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# SCHEMAS DE MOVIMIENTOS
# ============================================

class MovimientoInventarioBase(BaseModel):
    producto_id: int
    tipo: str = Field(..., pattern="^(entrada|salida|ajuste)$")
    cantidad: Decimal = Field(gt=0)
    observacion: Optional[str] = None
    usuario: Optional[str] = None


class MovimientoInventarioCreate(MovimientoInventarioBase):
    pass


class MovimientoInventario(MovimientoInventarioBase):
    id: int
    stock_anterior: Optional[Decimal]
    stock_nuevo: Optional[Decimal]
    fecha: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MovimientoConProducto(MovimientoInventario):
    """Movimiento con información del producto"""
    producto_nombre: str


# ============================================
# SCHEMAS DE VENTAS
# ============================================

class VentaDiariaBase(BaseModel):
    producto_id: int
    cantidad_vendida: Decimal = Field(gt=0)
    precio_venta: Decimal = Field(ge=0)
    fecha: date


class VentaDiariaCreate(VentaDiariaBase):
    pass


class VentaDiaria(VentaDiariaBase):
    id: int
    total: Decimal
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class VentaConProducto(VentaDiaria):
    """Venta con información del producto"""
    producto_nombre: str
    categoria_nombre: str


# ============================================
# SCHEMAS DE PRECIOS HISTÓRICOS
# ============================================

class PrecioHistoricoBase(BaseModel):
    producto_id: int
    precio: Decimal = Field(ge=0)
    costo: Optional[Decimal] = Field(None, ge=0)
    fecha_desde: date


class PrecioHistoricoCreate(PrecioHistoricoBase):
    pass


class PrecioHistorico(PrecioHistoricoBase):
    id: int
    fecha_hasta: Optional[date]
    activo: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# SCHEMAS DE REPORTES
# ============================================

class ReporteVentasPorProducto(BaseModel):
    producto_nombre: str
    categoria_nombre: str
    total_vendido: Decimal
    total_ingresos: Decimal
    dias_con_venta: int


class ReporteStockBajo(BaseModel):
    producto_id: int
    producto_nombre: str
    categoria: str
    stock_actual: Decimal
    stock_minimo: Decimal
    diferencia: Decimal


class ReporteInventarioValor(BaseModel):
    categoria: str
    cantidad_productos: int
    stock_total: Decimal
    valor_total: Decimal


class ResumenDashboard(BaseModel):
    """Resumen general para el dashboard"""
    total_productos: int
    total_productos_activos: int
    productos_stock_bajo: int
    valor_total_inventario: Decimal
    ventas_hoy: Decimal
    ventas_mes: Decimal


# ============================================
# SCHEMAS DE RESPUESTA
# ============================================

class RespuestaExito(BaseModel):
    mensaje: str
    datos: Optional[dict] = None


class RespuestaError(BaseModel):
    error: str
    detalle: Optional[str] = None
