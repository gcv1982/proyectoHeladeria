"""
Router de endpoints para productos
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database.connection import get_db
from app.models.models import Producto, Categoria, Inventario
from app.schemas.schemas import (
    Producto as ProductoSchema,
    ProductoCreate,
    ProductoUpdate,
    ProductoConStock,
    RespuestaExito
)

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("/", response_model=List[ProductoSchema])
def listar_productos(
    skip: int = 0,
    limit: int = 100,
    activo: Optional[bool] = None,
    categoria_id: Optional[int] = None,
    buscar: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Lista todos los productos con filtros opcionales
    
    - **skip**: Número de registros a saltar (para paginación)
    - **limit**: Número máximo de registros a devolver
    - **activo**: Filtrar por productos activos/inactivos
    - **categoria_id**: Filtrar por categoría
    - **buscar**: Buscar por nombre del producto
    """
    query = db.query(Producto)
    
    if activo is not None:
        query = query.filter(Producto.activo == activo)
    
    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)
    
    if buscar:
        query = query.filter(Producto.nombre.ilike(f"%{buscar}%"))
    
    productos = query.offset(skip).limit(limit).all()
    return productos


@router.get("/con-stock", response_model=List[ProductoConStock])
def listar_productos_con_stock(
    skip: int = 0,
    limit: int = 100,
    stock_bajo: bool = False,
    db: Session = Depends(get_db)
):
    """
    Lista productos con información de stock
    
    - **skip**: Número de registros a saltar
    - **limit**: Número máximo de registros
    - **stock_bajo**: Si es True, solo devuelve productos con stock bajo
    """
    query = db.query(
        Producto,
        Inventario.stock_actual,
        Inventario.stock_minimo,
        (Inventario.stock_actual * Producto.costo_unitario).label('valor_stock')
    ).join(Inventario, Producto.id == Inventario.producto_id)
    
    if stock_bajo:
        query = query.filter(Inventario.stock_actual <= Inventario.stock_minimo)
    
    resultados = query.offset(skip).limit(limit).all()
    
    productos_con_stock = []
    for producto, stock_actual, stock_minimo, valor_stock in resultados:
        # Determinar estado del stock
        if stock_actual <= stock_minimo:
            estado = 'BAJO'
        elif stock_actual <= stock_minimo * 1.5:
            estado = 'MEDIO'
        else:
            estado = 'OK'
        
        producto_dict = {
            **producto.__dict__,
            'stock_actual': stock_actual,
            'stock_minimo': stock_minimo,
            'estado_stock': estado,
            'valor_stock': valor_stock
        }
        productos_con_stock.append(ProductoConStock(**producto_dict))
    
    return productos_con_stock


@router.get("/{producto_id}", response_model=ProductoSchema)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un producto específico por su ID
    """
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoSchema, status_code=201)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo producto
    
    Automáticamente crea su entrada en inventario con stock 0
    """
    # Verificar que la categoría existe
    categoria = db.query(Categoria).filter(Categoria.id == producto.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    # Crear el producto
    db_producto = Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    
    # Crear entrada en inventario
    inventario = Inventario(
        producto_id=db_producto.id,
        stock_actual=0,
        stock_minimo=5
    )
    db.add(inventario)
    db.commit()
    
    return db_producto


@router.put("/{producto_id}", response_model=ProductoSchema)
def actualizar_producto(
    producto_id: int,
    producto_update: ProductoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un producto existente
    
    Solo actualiza los campos que se envían en el request
    """
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Actualizar solo los campos proporcionados
    update_data = producto_update.model_dump(exclude_unset=True)
    
    # Si se actualiza la categoría, verificar que existe
    if "categoria_id" in update_data:
        categoria = db.query(Categoria).filter(
            Categoria.id == update_data["categoria_id"]
        ).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    for field, value in update_data.items():
        setattr(db_producto, field, value)
    
    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.delete("/{producto_id}", response_model=RespuestaExito)
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):
    """
    Elimina (desactiva) un producto
    
    No lo borra de la base de datos, solo lo marca como inactivo
    """
    db_producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db_producto.activo = False
    db.commit()
    
    return RespuestaExito(
        mensaje="Producto desactivado exitosamente",
        datos={"producto_id": producto_id}
    )


@router.get("/categoria/{categoria_id}", response_model=List[ProductoSchema])
def listar_productos_por_categoria(
    categoria_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todos los productos de una categoría específica
    """
    # Verificar que la categoría existe
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    productos = db.query(Producto).filter(
        Producto.categoria_id == categoria_id,
        Producto.activo == True
    ).offset(skip).limit(limit).all()
    
    return productos
