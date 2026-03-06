"""
Servicio para gestión de productos
"""

from typing import List, Optional
from database import DatabaseConnection
from models import ProductoCreate, ProductoUpdate, Producto, ProductoConStock
from datetime import datetime


class ProductoService:
    """Servicio para operaciones con productos"""
    
    @staticmethod
    def crear_producto(producto: ProductoCreate) -> dict:
        """Crea un nuevo producto con su inventario inicial"""
        with DatabaseConnection.get_cursor() as cursor:
            # Insertar producto
            cursor.execute("""
                INSERT INTO productos (nombre, categoria_id, unidad_medida, precio_actual, costo_unitario, activo)
                VALUES (%(nombre)s, %(categoria_id)s, %(unidad_medida)s, %(precio_actual)s, %(costo_unitario)s, %(activo)s)
                RETURNING id, nombre, categoria_id, unidad_medida, precio_actual, costo_unitario, activo, created_at, updated_at
            """, producto.model_dump())
            
            nuevo_producto = cursor.fetchone()
            producto_id = nuevo_producto['id']
            
            # Crear inventario inicial en 0
            cursor.execute("""
                INSERT INTO inventario (producto_id, stock_actual, stock_minimo)
                VALUES (%s, 0, 5)
            """, (producto_id,))
            
            # Registrar precio histórico
            cursor.execute("""
                INSERT INTO precios_historicos (producto_id, precio, fecha_desde, activo)
                VALUES (%s, %s, CURRENT_DATE, true)
            """, (producto_id, producto.precio_actual))
            
            return nuevo_producto
    
    @staticmethod
    def obtener_productos(
        categoria_id: Optional[int] = None,
        activo: Optional[bool] = None,
        con_stock: bool = False
    ) -> List[dict]:
        """Obtiene lista de productos con filtros opcionales"""
        with DatabaseConnection.get_cursor() as cursor:
            query = """
                SELECT 
                    p.id, p.nombre, p.categoria_id, p.unidad_medida, 
                    p.precio_actual, p.costo_unitario, p.activo, 
                    p.created_at, p.updated_at,
                    c.nombre as categoria_nombre
            """
            
            if con_stock:
                query += """,
                    COALESCE(i.stock_actual, 0) as stock_actual,
                    COALESCE(i.stock_minimo, 0) as stock_minimo,
                    CASE 
                        WHEN COALESCE(i.stock_actual, 0) <= COALESCE(i.stock_minimo, 0) THEN 'BAJO'
                        WHEN COALESCE(i.stock_actual, 0) <= COALESCE(i.stock_minimo, 0) * 1.5 THEN 'MEDIO'
                        ELSE 'OK'
                    END as estado_stock
                """
            
            query += """
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
            """
            
            if con_stock:
                query += " LEFT JOIN inventario i ON p.id = i.producto_id"
            
            # Construir filtros
            filtros = []
            params = {}
            
            if categoria_id is not None:
                filtros.append("p.categoria_id = %(categoria_id)s")
                params['categoria_id'] = categoria_id
            
            if activo is not None:
                filtros.append("p.activo = %(activo)s")
                params['activo'] = activo
            
            if filtros:
                query += " WHERE " + " AND ".join(filtros)
            
            query += " ORDER BY c.nombre, p.nombre"
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    @staticmethod
    def obtener_producto(producto_id: int) -> Optional[dict]:
        """Obtiene un producto por ID"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    p.*,
                    c.nombre as categoria_nombre,
                    i.stock_actual,
                    i.stock_minimo
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                LEFT JOIN inventario i ON p.id = i.producto_id
                WHERE p.id = %s
            """, (producto_id,))
            return cursor.fetchone()
    
    @staticmethod
    def actualizar_producto(producto_id: int, datos: ProductoUpdate) -> Optional[dict]:
        """Actualiza un producto"""
        with DatabaseConnection.get_cursor() as cursor:
            # Construir query dinámico solo con campos que se envían
            campos_actualizar = []
            params = {}
            
            datos_dict = datos.model_dump(exclude_unset=True)
            
            for campo, valor in datos_dict.items():
                campos_actualizar.append(f"{campo} = %({campo})s")
                params[campo] = valor
            
            if not campos_actualizar:
                return ProductoService.obtener_producto(producto_id)
            
            params['producto_id'] = producto_id
            
            query = f"""
                UPDATE productos 
                SET {', '.join(campos_actualizar)}
                WHERE id = %(producto_id)s
                RETURNING *
            """
            
            cursor.execute(query, params)
            producto_actualizado = cursor.fetchone()
            
            # Si se actualizó el precio, registrar en histórico
            if 'precio_actual' in datos_dict:
                # Desactivar precio anterior
                cursor.execute("""
                    UPDATE precios_historicos 
                    SET activo = false, fecha_hasta = CURRENT_DATE
                    WHERE producto_id = %s AND activo = true
                """, (producto_id,))
                
                # Insertar nuevo precio
                cursor.execute("""
                    INSERT INTO precios_historicos (producto_id, precio, fecha_desde, activo)
                    VALUES (%s, %s, CURRENT_DATE, true)
                """, (producto_id, datos_dict['precio_actual']))
            
            return producto_actualizado
    
    @staticmethod
    def eliminar_producto(producto_id: int) -> bool:
        """Elimina (desactiva) un producto"""
        with DatabaseConnection.get_cursor() as cursor:
            cursor.execute("""
                UPDATE productos 
                SET activo = false
                WHERE id = %s
                RETURNING id
            """, (producto_id,))
            
            resultado = cursor.fetchone()
            return resultado is not None
    
    @staticmethod
    def productos_stock_bajo(limite: Optional[int] = None) -> List[dict]:
        """Obtiene productos con stock bajo"""
        with DatabaseConnection.get_cursor() as cursor:
            query = """
                SELECT 
                    p.id,
                    p.nombre,
                    c.nombre as categoria,
                    i.stock_actual,
                    i.stock_minimo,
                    CASE 
                        WHEN i.stock_actual <= i.stock_minimo THEN 'CRÍTICO'
                        WHEN i.stock_actual <= i.stock_minimo * 1.5 THEN 'BAJO'
                        ELSE 'MEDIO'
                    END as estado
                FROM productos p
                JOIN categorias c ON p.categoria_id = c.id
                JOIN inventario i ON p.id = i.producto_id
                WHERE p.activo = true 
                AND i.stock_actual <= i.stock_minimo * 1.5
                ORDER BY 
                    CASE 
                        WHEN i.stock_actual <= i.stock_minimo THEN 1
                        ELSE 2
                    END,
                    i.stock_actual ASC
            """
            
            if limite:
                query += f" LIMIT {limite}"
            
            cursor.execute(query)
            return cursor.fetchall()
