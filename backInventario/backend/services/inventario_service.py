"""
Servicio para gestión de inventario
"""

from typing import List, Optional
from database import DatabaseConnection
from models import MovimientoCreate, InventarioUpdate
from decimal import Decimal


class InventarioService:
    """Servicio para operaciones con inventario"""
    
    @staticmethod
    def obtener_inventario_completo() -> List[dict]:
        """Obtiene todo el inventario con información de productos"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    p.id as producto_id,
                    p.nombre as producto,
                    c.nombre as categoria,
                    i.stock_actual,
                    i.stock_minimo,
                    p.precio_actual,
                    p.costo_unitario,
                    (i.stock_actual * p.costo_unitario) as valor_stock,
                    CASE 
                        WHEN i.stock_actual <= i.stock_minimo THEN 'BAJO'
                        WHEN i.stock_actual <= i.stock_minimo * 1.5 THEN 'MEDIO'
                        ELSE 'OK'
                    END as estado_stock,
                    i.ultima_actualizacion
                FROM productos p
                JOIN categorias c ON p.categoria_id = c.id
                JOIN inventario i ON p.id = i.producto_id
                WHERE p.activo = true
                ORDER BY c.nombre, p.nombre
            """)
            return cursor.fetchall()
    
    @staticmethod
    def obtener_inventario_producto(producto_id: int) -> Optional[dict]:
        """Obtiene el inventario de un producto específico"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    i.*,
                    p.nombre as producto_nombre,
                    c.nombre as categoria_nombre
                FROM inventario i
                JOIN productos p ON i.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE i.producto_id = %s
            """, (producto_id,))
            return cursor.fetchone()
    
    @staticmethod
    def registrar_movimiento(movimiento: MovimientoCreate) -> dict:
        """
        Registra un movimiento de inventario (entrada, salida o ajuste)
        Actualiza automáticamente el stock
        """
        with DatabaseConnection.get_cursor() as cursor:
            # Obtener stock actual
            cursor.execute("""
                SELECT stock_actual 
                FROM inventario 
                WHERE producto_id = %s
            """, (movimiento.producto_id,))
            
            resultado = cursor.fetchone()
            if not resultado:
                raise ValueError(f"No existe inventario para el producto {movimiento.producto_id}")
            
            stock_anterior = resultado['stock_actual']
            
            # Calcular nuevo stock según tipo de movimiento
            if movimiento.tipo == 'entrada':
                stock_nuevo = stock_anterior + movimiento.cantidad
            elif movimiento.tipo == 'salida':
                stock_nuevo = stock_anterior - movimiento.cantidad
                if stock_nuevo < 0:
                    raise ValueError(f"Stock insuficiente. Stock actual: {stock_anterior}, intentando sacar: {movimiento.cantidad}")
            else:  # ajuste
                stock_nuevo = movimiento.cantidad
            
            # Registrar movimiento
            cursor.execute("""
                INSERT INTO movimientos_inventario 
                (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, observacion, usuario)
                VALUES (%(producto_id)s, %(tipo)s, %(cantidad)s, %(stock_anterior)s, %(stock_nuevo)s, %(observacion)s, %(usuario)s)
                RETURNING id, producto_id, tipo, cantidad, stock_anterior, stock_nuevo, fecha, observacion, usuario
            """, {
                **movimiento.model_dump(),
                'stock_anterior': stock_anterior,
                'stock_nuevo': stock_nuevo
            })
            
            nuevo_movimiento = cursor.fetchone()
            
            # El trigger actualiza automáticamente el inventario
            # Pero también podemos hacerlo manualmente para estar seguros
            cursor.execute("""
                UPDATE inventario 
                SET stock_actual = %s,
                    ultima_actualizacion = CURRENT_TIMESTAMP
                WHERE producto_id = %s
            """, (stock_nuevo, movimiento.producto_id))
            
            return nuevo_movimiento
    
    @staticmethod
    def obtener_movimientos(
        producto_id: Optional[int] = None,
        tipo: Optional[str] = None,
        limite: int = 100
    ) -> List[dict]:
        """Obtiene historial de movimientos con filtros opcionales"""
        with DatabaseConnection.get_cursor() as cursor:
            query = """
                SELECT 
                    m.*,
                    p.nombre as producto_nombre,
                    c.nombre as categoria_nombre
                FROM movimientos_inventario m
                JOIN productos p ON m.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE 1=1
            """
            
            params = {}
            
            if producto_id is not None:
                query += " AND m.producto_id = %(producto_id)s"
                params['producto_id'] = producto_id
            
            if tipo is not None:
                query += " AND m.tipo = %(tipo)s"
                params['tipo'] = tipo
            
            query += " ORDER BY m.fecha DESC LIMIT %(limite)s"
            params['limite'] = limite
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    @staticmethod
    def actualizar_stock_minimo(producto_id: int, stock_minimo: Decimal) -> dict:
        """Actualiza el stock mínimo de un producto"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                UPDATE inventario 
                SET stock_minimo = %s
                WHERE producto_id = %s
                RETURNING *
            """, (stock_minimo, producto_id))
            
            resultado = cursor.fetchone()
            if not resultado:
                raise ValueError(f"No existe inventario para el producto {producto_id}")
            
            return resultado
    
    @staticmethod
    def valor_total_inventario() -> dict:
        """Calcula el valor total del inventario"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT p.id) as total_productos,
                    COUNT(DISTINCT CASE WHEN p.activo = true THEN p.id END) as productos_activos,
                    COUNT(DISTINCT CASE WHEN i.stock_actual = 0 THEN p.id END) as productos_sin_stock,
                    COALESCE(SUM(i.stock_actual * p.costo_unitario), 0) as valor_total_inventario
                FROM productos p
                LEFT JOIN inventario i ON p.id = i.producto_id
            """)
            return cursor.fetchone()
    
    @staticmethod
    def productos_mas_vendidos(limite: int = 10) -> List[dict]:
        """Obtiene los productos más vendidos (basado en movimientos de salida)"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    p.id,
                    p.nombre,
                    c.nombre as categoria,
                    SUM(m.cantidad) as total_vendido,
                    COUNT(*) as cantidad_movimientos
                FROM movimientos_inventario m
                JOIN productos p ON m.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE m.tipo = 'salida'
                GROUP BY p.id, p.nombre, c.nombre
                ORDER BY total_vendido DESC
                LIMIT %s
            """, (limite,))
            return cursor.fetchall()
