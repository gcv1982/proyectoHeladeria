"""
Modelos SQLAlchemy que mapean las tablas de la base de datos
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Date, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relación con productos
    productos = relationship("Producto", back_populates="categoria")


class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    unidad_medida = Column(String(20), nullable=False)
    precio_actual = Column(Numeric(10, 2), nullable=False, default=0)
    costo_unitario = Column(Numeric(10, 2), nullable=False, default=0)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    inventario = relationship("Inventario", back_populates="producto", uselist=False)
    movimientos = relationship("MovimientoInventario", back_populates="producto")
    ventas = relationship("VentaDiaria", back_populates="producto")
    precios_historicos = relationship("PrecioHistorico", back_populates="producto")
    
    __table_args__ = (
        CheckConstraint("unidad_medida IN ('kg', 'litro', 'unidad')", name="check_unidad_medida"),
    )


class Inventario(Base):
    __tablename__ = "inventario"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), unique=True)
    stock_actual = Column(Numeric(10, 2), nullable=False, default=0)
    stock_minimo = Column(Numeric(10, 2), default=0)
    ultima_actualizacion = Column(DateTime, server_default=func.now())
    
    # Relación
    producto = relationship("Producto", back_populates="inventario")


class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    tipo = Column(String(20), nullable=False)
    cantidad = Column(Numeric(10, 2), nullable=False)
    stock_anterior = Column(Numeric(10, 2))
    stock_nuevo = Column(Numeric(10, 2))
    fecha = Column(DateTime, server_default=func.now())
    observacion = Column(Text)
    usuario = Column(String(100))
    
    # Relación
    producto = relationship("Producto", back_populates="movimientos")
    
    __table_args__ = (
        CheckConstraint("tipo IN ('entrada', 'salida', 'ajuste')", name="check_tipo_movimiento"),
    )


class VentaDiaria(Base):
    __tablename__ = "ventas_diarias"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    cantidad_vendida = Column(Numeric(10, 2), nullable=False)
    precio_venta = Column(Numeric(10, 2), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    fecha = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relación
    producto = relationship("Producto", back_populates="ventas")


class PrecioHistorico(Base):
    __tablename__ = "precios_historicos"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    precio = Column(Numeric(10, 2), nullable=False)
    costo = Column(Numeric(10, 2))
    fecha_desde = Column(Date, nullable=False)
    fecha_hasta = Column(Date)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relación
    producto = relationship("Producto", back_populates="precios_historicos")
