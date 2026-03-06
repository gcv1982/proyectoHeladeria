"""
Router de endpoints para inventario
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.database.connection import get_db
from app.models.models import Inventario, Producto, MovimientoInventario
from app.schemas.schemas import (
    Inventario as InventarioSchema,
    InventarioUpdate,
    MovimientoInventarioCreate,
    MovimientoInventario as MovimientoSchema,
    MovimientoConProducto,
    RespuestaExito
)

router = APIRouter(
    prefix="/inventario",
    tags=["Inventario"]
)


@router.get("/", response_model=List[InventarioSchema])
def listar_inventario(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todo el inventario
    """
    inventario = db.query(Inventario).offset(skip).limit(limit).all()
    return inventario


@router.get("/stock-bajo", response_model=List[dict])
def productos_stock_bajo(db: Session = Depends(get_db)):
    """
    Lista productos con stock bajo (stock_actual <= stock_minimo)
    """
    resultados = db.query(
        Producto.id,
        Producto.nombre,
        Inventario.stock_actual,
        Inventario.stock_minimo
    ).join(
        Inventario, Producto.id == Inventario.producto_id
    ).filter(
        Inventario.stock_actual <= Inventario.stock_minimo,
        Producto.activo == True
    ).all()
    
    productos_bajo = []
    for prod_id, nombre, stock_actual, stock_minimo in resultados:
        productos_bajo.append({
            "producto_id": prod_id,
            "nombre": nombre,
            "stock_actual": float(stock_actual),
            "stock_minimo": float(stock_minimo),
            "diferencia": float(stock_minimo - stock_actual)
        })
    
    return productos_bajo


@router.get("/producto/{producto_id}", response_model=InventarioSchema)
def obtener_inventario_producto(producto_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el inventario de un producto específico
    """
    inventario = db.query(Inventario).filter(
        Inventario.producto_id == producto_id
    ).first()
    
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    
    return inventario


@router.put("/producto/{producto_id}", response_model=InventarioSchema)
def actualizar_stock_minimo(
    producto_id: int,
    inventario_update: InventarioUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza el stock mínimo de un producto
    
    Para actualizar el stock_actual, usar el endpoint de movimientos
    """
    inventario = db.query(Inventario).filter(
        Inventario.producto_id == producto_id
    ).first()
    
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    
    if inventario_update.stock_minimo is not None:
        inventario.stock_minimo = inventario_update.stock_minimo
    
    inventario.ultima_actualizacion = datetime.now()
    db.commit()
    db.refresh(inventario)
    
    return inventario


@router.post("/movimiento", response_model=MovimientoSchema, status_code=201)
def registrar_movimiento(
    movimiento: MovimientoInventarioCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un movimiento de inventario (entrada, salida o ajuste)
    
    Actualiza automáticamente el stock del producto
    
    - **entrada**: Incrementa el stock (ej: recepción de mercadería)
    - **salida**: Disminuye el stock (ej: venta, merma)
    - **ajuste**: Ajuste manual del stock
    """
    # Verificar que el producto existe
    producto = db.query(Producto).filter(Producto.id == movimiento.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Obtener inventario actual
    inventario = db.query(Inventario).filter(
        Inventario.producto_id == movimiento.producto_id
    ).first()
    
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario no encontrado")
    
    stock_anterior = inventario.stock_actual
    
    # Calcular nuevo stock según el tipo de movimiento
    if movimiento.tipo == 'entrada':
        stock_nuevo = stock_anterior + movimiento.cantidad
    elif movimiento.tipo == 'salida':
        stock_nuevo = stock_anterior - movimiento.cantidad
        if stock_nuevo < 0:
            raise HTTPException(
                status_code=400,
                detail="No hay suficiente stock para realizar la salida"
            )
    else:  # ajuste
        stock_nuevo = movimiento.cantidad
    
    # Crear el movimiento
    db_movimiento = MovimientoInventario(
        **movimiento.model_dump(),
        stock_anterior=stock_anterior,
        stock_nuevo=stock_nuevo,
        fecha=datetime.now()
    )
    db.add(db_movimiento)
    
    # Actualizar inventario
    inventario.stock_actual = stock_nuevo
    inventario.ultima_actualizacion = datetime.now()
    
    db.commit()
    db.refresh(db_movimiento)
    
    return db_movimiento


@router.get("/movimientos", response_model=List[MovimientoConProducto])
def listar_movimientos(
    skip: int = 0,
    limit: int = 100,
    tipo: str = None,
    producto_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Lista los movimientos de inventario con filtros opcionales
    
    - **tipo**: Filtrar por tipo de movimiento (entrada, salida, ajuste)
    - **producto_id**: Filtrar por producto específico
    """
    query = db.query(
        MovimientoInventario,
        Producto.nombre.label('producto_nombre')
    ).join(Producto, MovimientoInventario.producto_id == Producto.id)
    
    if tipo:
        query = query.filter(MovimientoInventario.tipo == tipo)
    
    if producto_id:
        query = query.filter(MovimientoInventario.producto_id == producto_id)
    
    query = query.order_by(MovimientoInventario.fecha.desc())
    movimientos = query.offset(skip).limit(limit).all()
    
    resultado = []
    for movimiento, producto_nombre in movimientos:
        movimiento_dict = {
            **movimiento.__dict__,
            'producto_nombre': producto_nombre
        }
        resultado.append(MovimientoConProducto(**movimiento_dict))
    
    return resultado


@router.get("/movimientos/producto/{producto_id}", response_model=List[MovimientoSchema])
def listar_movimientos_producto(
    producto_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Lista todos los movimientos de un producto específico
    """
    # Verificar que el producto existe
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    movimientos = db.query(MovimientoInventario).filter(
        MovimientoInventario.producto_id == producto_id
    ).order_by(
        MovimientoInventario.fecha.desc()
    ).offset(skip).limit(limit).all()
    
    return movimientos


@router.get("/valor-total")
def calcular_valor_inventario(db: Session = Depends(get_db)):
    """
    Calcula el valor total del inventario
    
    Suma: stock_actual * costo_unitario de todos los productos
    """
    resultado = db.query(
        func.sum(Inventario.stock_actual * Producto.costo_unitario).label('valor_total')
    ).join(
        Producto, Inventario.producto_id == Producto.id
    ).filter(
        Producto.activo == True
    ).first()
    
    valor_total = float(resultado.valor_total) if resultado.valor_total else 0.0
    
    return {
        "valor_total": valor_total,
        "mensaje": f"Valor total del inventario: ${valor_total:,.2f}"
    }
