"""
Servicio para gestión de ventas
"""

from typing import List, Optional
from database import DatabaseConnection
from models import VentaCreate
from datetime import date, datetime, timedelta
from decimal import Decimal


class VentaService:
    """Servicio para operaciones con ventas"""
    
    @staticmethod
    def registrar_venta(venta: VentaCreate) -> dict:
        """
        Registra una venta y automáticamente descuenta del inventario
        """
        with DatabaseConnection.get_cursor() as cursor:
            # Verificar que hay stock suficiente
            cursor.execute("""
                SELECT stock_actual 
                FROM inventario 
                WHERE producto_id = %s
            """, (venta.producto_id,))
            
            resultado = cursor.fetchone()
            if not resultado:
                raise ValueError(f"No existe inventario para el producto {venta.producto_id}")
            
            stock_actual = resultado['stock_actual']
            if stock_actual < venta.cantidad_vendida:
                raise ValueError(f"Stock insuficiente. Stock actual: {stock_actual}, solicitado: {venta.cantidad_vendida}")
            
            # Calcular total
            total = venta.cantidad_vendida * venta.precio_venta
            
            # Usar fecha actual si no se proporciona
            fecha_venta = venta.fecha or date.today()
            
            # Registrar venta
            cursor.execute("""
                INSERT INTO ventas_diarias 
                (producto_id, cantidad_vendida, precio_venta, total, fecha)
                VALUES (%(producto_id)s, %(cantidad_vendida)s, %(precio_venta)s, %(total)s, %(fecha)s)
                RETURNING id, producto_id, cantidad_vendida, precio_venta, total, fecha, created_at
            """, {
                'producto_id': venta.producto_id,
                'cantidad_vendida': venta.cantidad_vendida,
                'precio_venta': venta.precio_venta,
                'total': total,
                'fecha': fecha_venta
            })
            
            nueva_venta = cursor.fetchone()
            
            # Registrar movimiento de salida en inventario
            stock_nuevo = stock_actual - venta.cantidad_vendida
            cursor.execute("""
                INSERT INTO movimientos_inventario 
                (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, observacion)
                VALUES (%s, 'salida', %s, %s, %s, %s)
            """, (
                venta.producto_id,
                venta.cantidad_vendida,
                stock_actual,
                stock_nuevo,
                f'Venta registrada - ID: {nueva_venta["id"]}'
            ))
            
            return nueva_venta
    
    @staticmethod
    def registrar_ventas_masivas(ventas: List[VentaCreate]) -> dict:
        """Registra múltiples ventas en una sola transacción"""
        with DatabaseConnection.get_cursor() as cursor:
            ventas_registradas = []
            total_general = Decimal(0)
            
            for venta in ventas:
                # Verificar stock
                cursor.execute("""
                    SELECT stock_actual 
                    FROM inventario 
                    WHERE producto_id = %s
                """, (venta.producto_id,))
                
                resultado = cursor.fetchone()
                if not resultado:
                    raise ValueError(f"No existe inventario para el producto {venta.producto_id}")
                
                stock_actual = resultado['stock_actual']
                if stock_actual < venta.cantidad_vendida:
                    cursor.execute("SELECT nombre FROM productos WHERE id = %s", (venta.producto_id,))
                    producto = cursor.fetchone()
                    raise ValueError(f"Stock insuficiente para '{producto['nombre']}'. Stock: {stock_actual}, solicitado: {venta.cantidad_vendida}")
                
                # Calcular total
                total = venta.cantidad_vendida * venta.precio_venta
                total_general += total
                
                fecha_venta = venta.fecha or date.today()
                
                # Registrar venta
                cursor.execute("""
                    INSERT INTO ventas_diarias 
                    (producto_id, cantidad_vendida, precio_venta, total, fecha)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """, (venta.producto_id, venta.cantidad_vendida, venta.precio_venta, total, fecha_venta))
                
                venta_id = cursor.fetchone()['id']
                ventas_registradas.append(venta_id)
                
                # Registrar movimiento
                stock_nuevo = stock_actual - venta.cantidad_vendida
                cursor.execute("""
                    INSERT INTO movimientos_inventario 
                    (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, observacion)
                    VALUES (%s, 'salida', %s, %s, %s, %s)
                """, (venta.producto_id, venta.cantidad_vendida, stock_actual, stock_nuevo, f'Venta masiva - ID: {venta_id}'))
            
            return {
                'ventas_registradas': len(ventas_registradas),
                'ids': ventas_registradas,
                'total_general': float(total_general)
            }
    
    @staticmethod
    def obtener_ventas(
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        producto_id: Optional[int] = None,
        limite: int = 100
    ) -> List[dict]:
        """Obtiene ventas con filtros opcionales"""
        with DatabaseConnection.get_cursor() as cursor:
            query = """
                SELECT 
                    v.*,
                    p.nombre as producto_nombre,
                    c.nombre as categoria_nombre
                FROM ventas_diarias v
                JOIN productos p ON v.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE 1=1
            """
            
            params = {}
            
            if fecha_desde:
                query += " AND v.fecha >= %(fecha_desde)s"
                params['fecha_desde'] = fecha_desde
            
            if fecha_hasta:
                query += " AND v.fecha <= %(fecha_hasta)s"
                params['fecha_hasta'] = fecha_hasta
            
            if producto_id:
                query += " AND v.producto_id = %(producto_id)s"
                params['producto_id'] = producto_id
            
            query += " ORDER BY v.fecha DESC, v.created_at DESC LIMIT %(limite)s"
            params['limite'] = limite
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    @staticmethod
    def resumen_ventas_dia(fecha: Optional[date] = None) -> dict:
        """Obtiene resumen de ventas de un día específico"""
        if not fecha:
            fecha = date.today()
        
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COUNT(*) as cantidad_transacciones,
                    SUM(cantidad_vendida) as total_productos_vendidos,
                    SUM(total) as total_ventas
                FROM ventas_diarias
                WHERE fecha = %s
            """, (fecha,))
            
            return cursor.fetchone()
    
    @staticmethod
    def ventas_por_producto(
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None
    ) -> List[dict]:
        """Obtiene resumen de ventas agrupado por producto"""
        with DatabaseConnection.get_cursor() as cursor:
            query = """
                SELECT 
                    p.id as producto_id,
                    p.nombre as producto,
                    c.nombre as categoria,
                    SUM(v.cantidad_vendida) as cantidad_vendida,
                    SUM(v.total) as total_ingresos,
                    COUNT(*) as cantidad_transacciones,
                    AVG(v.precio_venta) as precio_promedio
                FROM ventas_diarias v
                JOIN productos p ON v.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE 1=1
            """
            
            params = {}
            
            if fecha_desde:
                query += " AND v.fecha >= %(fecha_desde)s"
                params['fecha_desde'] = fecha_desde
            
            if fecha_hasta:
                query += " AND v.fecha <= %(fecha_hasta)s"
                params['fecha_hasta'] = fecha_hasta
            
            query += """
                GROUP BY p.id, p.nombre, c.nombre
                ORDER BY total_ingresos DESC
            """
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    @staticmethod
    def ventas_por_categoria(
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None
    ) -> List[dict]:
        """Obtiene resumen de ventas agrupado por categoría"""
        with DatabaseConnection.get_cursor() as cursor:
            query = """
                SELECT 
                    c.id as categoria_id,
                    c.nombre as categoria,
                    SUM(v.cantidad_vendida) as cantidad_vendida,
                    SUM(v.total) as total_ingresos,
                    COUNT(DISTINCT v.producto_id) as productos_vendidos,
                    COUNT(*) as cantidad_transacciones
                FROM ventas_diarias v
                JOIN productos p ON v.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE 1=1
            """
            
            params = {}
            
            if fecha_desde:
                query += " AND v.fecha >= %(fecha_desde)s"
                params['fecha_desde'] = fecha_desde
            
            if fecha_hasta:
                query += " AND v.fecha <= %(fecha_hasta)s"
                params['fecha_hasta'] = fecha_hasta
            
            query += """
                GROUP BY c.id, c.nombre
                ORDER BY total_ingresos DESC
            """
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    @staticmethod
    def top_productos_vendidos(limite: int = 10, dias: int = 30) -> List[dict]:
        """Obtiene los productos más vendidos en los últimos N días"""
        fecha_desde = date.today() - timedelta(days=dias)
        
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    p.id,
                    p.nombre,
                    c.nombre as categoria,
                    SUM(v.cantidad_vendida) as total_vendido,
                    SUM(v.total) as total_ingresos,
                    COUNT(*) as cantidad_ventas
                FROM ventas_diarias v
                JOIN productos p ON v.producto_id = p.id
                JOIN categorias c ON p.categoria_id = c.id
                WHERE v.fecha >= %s
                GROUP BY p.id, p.nombre, c.nombre
                ORDER BY total_vendido DESC
                LIMIT %s
            """, (fecha_desde, limite))
            
            return cursor.fetchall()
