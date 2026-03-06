"""
Router de endpoints para ventas
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.database.connection import get_db
from app.models.models import VentaDiaria, Producto, Categoria, Inventario, MovimientoInventario
from app.schemas.schemas import (
    VentaDiaria as VentaDiariaSchema,
    VentaDiariaCreate,
    VentaConProducto,
    ReporteVentasPorProducto,
    RespuestaExito
)

router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)


@router.post("/", response_model=VentaDiariaSchema, status_code=201)
def registrar_venta(venta: VentaDiariaCreate, db: Session = Depends(get_db)):
    """
    Registra una nueva venta
    
    Automáticamente:
    - Calcula el total (cantidad * precio)
    - Registra un movimiento de salida en el inventario
    - Actualiza el stock del producto
    """
    # Verificar que el producto existe
    producto = db.query(Producto).filter(Producto.id == venta.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Verificar que hay suficiente stock
    inventario = db.query(Inventario).filter(
        Inventario.producto_id == venta.producto_id
    ).first()
    
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    
    if inventario.stock_actual < venta.cantidad_vendida:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Stock actual: {inventario.stock_actual}"
        )
    
    # Calcular total
    total = venta.cantidad_vendida * venta.precio_venta
    
    # Crear la venta
    db_venta = VentaDiaria(
        **venta.model_dump(),
        total=total
    )
    db.add(db_venta)
    
    # Registrar movimiento de inventario (salida)
    stock_anterior = inventario.stock_actual
    stock_nuevo = stock_anterior - venta.cantidad_vendida
    
    movimiento = MovimientoInventario(
        producto_id=venta.producto_id,
        tipo='salida',
        cantidad=venta.cantidad_vendida,
        stock_anterior=stock_anterior,
        stock_nuevo=stock_nuevo,
        observacion=f'Venta registrada - Total: ${total}',
        fecha=datetime.now()
    )
    db.add(movimiento)
    
    # Actualizar stock
    inventario.stock_actual = stock_nuevo
    inventario.ultima_actualizacion = datetime.now()
    
    db.commit()
    db.refresh(db_venta)
    
    return db_venta


@router.get("/", response_model=List[VentaConProducto])
def listar_ventas(
    skip: int = 0,
    limit: int = 100,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    producto_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Lista todas las ventas con filtros opcionales
    
    - **fecha_desde**: Filtrar desde esta fecha
    - **fecha_hasta**: Filtrar hasta esta fecha
    - **producto_id**: Filtrar por producto
    """
    query = db.query(
        VentaDiaria,
        Producto.nombre.label('producto_nombre'),
        Categoria.nombre.label('categoria_nombre')
    ).join(
        Producto, VentaDiaria.producto_id == Producto.id
    ).join(
        Categoria, Producto.categoria_id == Categoria.id
    )
    
    if fecha_desde:
        query = query.filter(VentaDiaria.fecha >= fecha_desde)
    
    if fecha_hasta:
        query = query.filter(VentaDiaria.fecha <= fecha_hasta)
    
    if producto_id:
        query = query.filter(VentaDiaria.producto_id == producto_id)
    
    query = query.order_by(VentaDiaria.fecha.desc())
    ventas = query.offset(skip).limit(limit).all()
    
    resultado = []
    for venta, producto_nombre, categoria_nombre in ventas:
        venta_dict = {
            **venta.__dict__,
            'producto_nombre': producto_nombre,
            'categoria_nombre': categoria_nombre
        }
        resultado.append(VentaConProducto(**venta_dict))
    
    return resultado


@router.get("/hoy", response_model=List[VentaConProducto])
def ventas_del_dia(db: Session = Depends(get_db)):
    """
    Lista todas las ventas del día actual
    """
    hoy = date.today()
    
    ventas = db.query(
        VentaDiaria,
        Producto.nombre.label('producto_nombre'),
        Categoria.nombre.label('categoria_nombre')
    ).join(
        Producto, VentaDiaria.producto_id == Producto.id
    ).join(
        Categoria, Producto.categoria_id == Categoria.id
    ).filter(
        VentaDiaria.fecha == hoy
    ).all()
    
    resultado = []
    for venta, producto_nombre, categoria_nombre in ventas:
        venta_dict = {
            **venta.__dict__,
            'producto_nombre': producto_nombre,
            'categoria_nombre': categoria_nombre
        }
        resultado.append(VentaConProducto(**venta_dict))
    
    return resultado


@router.get("/total-dia")
def total_ventas_dia(fecha: Optional[date] = None, db: Session = Depends(get_db)):
    """
    Calcula el total de ventas de un día específico
    
    Si no se proporciona fecha, usa el día actual
    """
    if not fecha:
        fecha = date.today()
    
    total = db.query(
        func.sum(VentaDiaria.total).label('total_dia')
    ).filter(
        VentaDiaria.fecha == fecha
    ).first()
    
    total_dia = float(total.total_dia) if total.total_dia else 0.0
    
    return {
        "fecha": fecha,
        "total_ventas": total_dia,
        "mensaje": f"Total de ventas del {fecha}: ${total_dia:,.2f}"
    }


@router.get("/total-mes")
def total_ventas_mes(
    año: Optional[int] = None,
    mes: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Calcula el total de ventas de un mes específico
    
    Si no se proporciona año/mes, usa el mes actual
    """
    hoy = date.today()
    año = año or hoy.year
    mes = mes or hoy.month
    
    # Calcular primer y último día del mes
    primer_dia = date(año, mes, 1)
    if mes == 12:
        ultimo_dia = date(año + 1, 1, 1) - timedelta(days=1)
    else:
        ultimo_dia = date(año, mes + 1, 1) - timedelta(days=1)
    
    total = db.query(
        func.sum(VentaDiaria.total).label('total_mes')
    ).filter(
        and_(
            VentaDiaria.fecha >= primer_dia,
            VentaDiaria.fecha <= ultimo_dia
        )
    ).first()
    
    total_mes = float(total.total_mes) if total.total_mes else 0.0
    
    return {
        "año": año,
        "mes": mes,
        "total_ventas": total_mes,
        "mensaje": f"Total de ventas de {mes}/{año}: ${total_mes:,.2f}"
    }


@router.get("/reporte/por-producto", response_model=List[ReporteVentasPorProducto])
def reporte_ventas_por_producto(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Genera un reporte de ventas agrupado por producto
    
    Muestra:
    - Total vendido (cantidad)
    - Total de ingresos ($)
    - Días con venta
    """
    query = db.query(
        Producto.nombre.label('producto_nombre'),
        Categoria.nombre.label('categoria_nombre'),
        func.sum(VentaDiaria.cantidad_vendida).label('total_vendido'),
        func.sum(VentaDiaria.total).label('total_ingresos'),
        func.count(func.distinct(VentaDiaria.fecha)).label('dias_con_venta')
    ).join(
        Producto, VentaDiaria.producto_id == Producto.id
    ).join(
        Categoria, Producto.categoria_id == Categoria.id
    )
    
    if fecha_desde:
        query = query.filter(VentaDiaria.fecha >= fecha_desde)
    
    if fecha_hasta:
        query = query.filter(VentaDiaria.fecha <= fecha_hasta)
    
    query = query.group_by(
        Producto.nombre,
        Categoria.nombre
    ).order_by(
        func.sum(VentaDiaria.total).desc()
    )
    
    resultados = query.all()
    
    reporte = []
    for producto_nombre, categoria_nombre, total_vendido, total_ingresos, dias_con_venta in resultados:
        reporte.append(ReporteVentasPorProducto(
            producto_nombre=producto_nombre,
            categoria_nombre=categoria_nombre,
            total_vendido=float(total_vendido),
            total_ingresos=float(total_ingresos),
            dias_con_venta=dias_con_venta
        ))
    
    return reporte


@router.get("/reporte/por-categoria")
def reporte_ventas_por_categoria(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Genera un reporte de ventas agrupado por categoría
    """
    query = db.query(
        Categoria.nombre.label('categoria'),
        func.sum(VentaDiaria.cantidad_vendida).label('total_vendido'),
        func.sum(VentaDiaria.total).label('total_ingresos')
    ).join(
        Producto, VentaDiaria.producto_id == Producto.id
    ).join(
        Categoria, Producto.categoria_id == Categoria.id
    )
    
    if fecha_desde:
        query = query.filter(VentaDiaria.fecha >= fecha_desde)
    
    if fecha_hasta:
        query = query.filter(VentaDiaria.fecha <= fecha_hasta)
    
    query = query.group_by(Categoria.nombre).order_by(
        func.sum(VentaDiaria.total).desc()
    )
    
    resultados = query.all()
    
    reporte = []
    for categoria, total_vendido, total_ingresos in resultados:
        reporte.append({
            "categoria": categoria,
            "total_vendido": float(total_vendido),
            "total_ingresos": float(total_ingresos)
        })
    
    return reporte


@router.get("/producto/{producto_id}", response_model=List[VentaDiariaSchema])
def ventas_por_producto(
    producto_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todas las ventas de un producto específico
    """
    # Verificar que el producto existe
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    ventas = db.query(VentaDiaria).filter(
        VentaDiaria.producto_id == producto_id
    ).order_by(
        VentaDiaria.fecha.desc()
    ).offset(skip).limit(limit).all()
    
    return ventas
