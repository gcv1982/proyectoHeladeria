"""
Router de endpoints para categorías y dashboard
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date
from app.database.connection import get_db
from app.models.models import Categoria, Producto, Inventario, VentaDiaria
from app.schemas.schemas import (
    Categoria as CategoriaSchema,
    CategoriaCreate,
    ResumenDashboard
)

router = APIRouter()


# ============================================
# ENDPOINTS DE CATEGORÍAS
# ============================================

categorias_router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"]
)


@categorias_router.get("/", response_model=List[CategoriaSchema])
def listar_categorias(
    skip: int = 0,
    limit: int = 100,
    activo: bool = None,
    db: Session = Depends(get_db)
):
    """
    Lista todas las categorías
    """
    query = db.query(Categoria)
    
    if activo is not None:
        query = query.filter(Categoria.activo == activo)
    
    categorias = query.offset(skip).limit(limit).all()
    return categorias


@categorias_router.get("/{categoria_id}", response_model=CategoriaSchema)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una categoría específica por su ID
    """
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@categorias_router.post("/", response_model=CategoriaSchema, status_code=201)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva categoría
    """
    # Verificar que no existe una categoría con el mismo nombre
    existe = db.query(Categoria).filter(Categoria.nombre == categoria.nombre).first()
    if existe:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una categoría con ese nombre"
        )
    
    db_categoria = Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    
    return db_categoria


# ============================================
# ENDPOINTS DE DASHBOARD
# ============================================

dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@dashboard_router.get("/resumen", response_model=ResumenDashboard)
def obtener_resumen_dashboard(db: Session = Depends(get_db)):
    """
    Obtiene un resumen general para el dashboard
    
    Incluye:
    - Total de productos
    - Productos activos
    - Productos con stock bajo
    - Valor total del inventario
    - Ventas de hoy
    - Ventas del mes
    """
    # Total de productos
    total_productos = db.query(func.count(Producto.id)).scalar()
    
    # Productos activos
    productos_activos = db.query(func.count(Producto.id)).filter(
        Producto.activo == True
    ).scalar()
    
    # Productos con stock bajo
    productos_stock_bajo = db.query(func.count(Inventario.id)).join(
        Producto, Inventario.producto_id == Producto.id
    ).filter(
        Inventario.stock_actual <= Inventario.stock_minimo,
        Producto.activo == True
    ).scalar()
    
    # Valor total del inventario
    valor_total = db.query(
        func.sum(Inventario.stock_actual * Producto.costo_unitario)
    ).join(
        Producto, Inventario.producto_id == Producto.id
    ).filter(
        Producto.activo == True
    ).scalar()
    
    valor_total = float(valor_total) if valor_total else 0.0
    
    # Ventas de hoy
    hoy = date.today()
    ventas_hoy = db.query(func.sum(VentaDiaria.total)).filter(
        VentaDiaria.fecha == hoy
    ).scalar()
    
    ventas_hoy = float(ventas_hoy) if ventas_hoy else 0.0
    
    # Ventas del mes actual
    primer_dia_mes = date(hoy.year, hoy.month, 1)
    ventas_mes = db.query(func.sum(VentaDiaria.total)).filter(
        VentaDiaria.fecha >= primer_dia_mes,
        VentaDiaria.fecha <= hoy
    ).scalar()
    
    ventas_mes = float(ventas_mes) if ventas_mes else 0.0
    
    return ResumenDashboard(
        total_productos=total_productos,
        total_productos_activos=productos_activos,
        productos_stock_bajo=productos_stock_bajo,
        valor_total_inventario=valor_total,
        ventas_hoy=ventas_hoy,
        ventas_mes=ventas_mes
    )


@dashboard_router.get("/productos-mas-vendidos")
def productos_mas_vendidos(
    limite: int = 10,
    db: Session = Depends(get_db)
):
    """
    Obtiene los N productos más vendidos (por cantidad)
    """
    hoy = date.today()
    primer_dia_mes = date(hoy.year, hoy.month, 1)
    
    productos = db.query(
        Producto.nombre,
        func.sum(VentaDiaria.cantidad_vendida).label('total_vendido'),
        func.sum(VentaDiaria.total).label('ingresos')
    ).join(
        VentaDiaria, Producto.id == VentaDiaria.producto_id
    ).filter(
        VentaDiaria.fecha >= primer_dia_mes,
        VentaDiaria.fecha <= hoy
    ).group_by(
        Producto.nombre
    ).order_by(
        func.sum(VentaDiaria.cantidad_vendida).desc()
    ).limit(limite).all()
    
    resultado = []
    for nombre, total_vendido, ingresos in productos:
        resultado.append({
            "producto": nombre,
            "cantidad_vendida": float(total_vendido),
            "ingresos": float(ingresos)
        })
    
    return resultado


@dashboard_router.get("/alertas")
def obtener_alertas(db: Session = Depends(get_db)):
    """
    Obtiene alertas importantes del sistema
    
    - Productos con stock bajo
    - Productos sin stock
    - Productos inactivos con ventas recientes
    """
    alertas = {
        "stock_bajo": [],
        "sin_stock": [],
        "criticas": 0
    }
    
    # Productos con stock bajo
    stock_bajo = db.query(
        Producto.id,
        Producto.nombre,
        Inventario.stock_actual,
        Inventario.stock_minimo
    ).join(
        Inventario, Producto.id == Inventario.producto_id
    ).filter(
        Inventario.stock_actual <= Inventario.stock_minimo,
        Inventario.stock_actual > 0,
        Producto.activo == True
    ).all()
    
    for prod_id, nombre, stock_actual, stock_minimo in stock_bajo:
        alertas["stock_bajo"].append({
            "producto_id": prod_id,
            "nombre": nombre,
            "stock_actual": float(stock_actual),
            "stock_minimo": float(stock_minimo)
        })
    
    # Productos sin stock
    sin_stock = db.query(
        Producto.id,
        Producto.nombre
    ).join(
        Inventario, Producto.id == Inventario.producto_id
    ).filter(
        Inventario.stock_actual == 0,
        Producto.activo == True
    ).all()
    
    for prod_id, nombre in sin_stock:
        alertas["sin_stock"].append({
            "producto_id": prod_id,
            "nombre": nombre
        })
    
    # Contar alertas críticas (sin stock)
    alertas["criticas"] = len(alertas["sin_stock"])
    
    return alertas


# Incluir los routers en el router principal
router.include_router(categorias_router)
router.include_router(dashboard_router)
