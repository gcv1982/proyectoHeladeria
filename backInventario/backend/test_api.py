"""
Script de prueba para testear los endpoints de la API
"""

import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"

def print_resultado(titulo, respuesta):
    """Imprime el resultado de una petición de forma bonita"""
    print("\n" + "="*60)
    print(f"✓ {titulo}")
    print("="*60)
    print(f"Status Code: {respuesta.status_code}")
    if respuesta.status_code < 400:
        try:
            data = respuesta.json()
            print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
        except:
            print(respuesta.text)
    else:
        print(f"Error: {respuesta.text}")


def test_api():
    """Ejecuta tests básicos de la API"""
    
    print("\n🚀 INICIANDO TESTS DE LA API")
    print("="*60)
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health")
        print_resultado("1. Health Check", r)
    except Exception as e:
        print(f"\n❌ Error conectando a la API: {e}")
        print("Asegúrate de que el servidor esté corriendo: python main.py")
        return
    
    # 2. Listar productos
    try:
        r = requests.get(f"{BASE_URL}/api/productos")
        print_resultado("2. Listar Productos", r)
        if r.status_code == 200:
            productos = r.json()
            if len(productos) > 0:
                producto_id = productos[0]['id']
                print(f"\n   → Encontrados {len(productos)} productos")
                print(f"   → Usando producto_id={producto_id} para siguientes tests")
            else:
                print("\n   ⚠️  No hay productos en la base de datos")
                return
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return
    
    # 3. Obtener un producto específico
    try:
        r = requests.get(f"{BASE_URL}/api/productos/{producto_id}")
        print_resultado(f"3. Obtener Producto ID {producto_id}", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 4. Productos con stock bajo
    try:
        r = requests.get(f"{BASE_URL}/api/productos/stock-bajo")
        print_resultado("4. Productos con Stock Bajo", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 5. Inventario completo
    try:
        r = requests.get(f"{BASE_URL}/api/inventario")
        print_resultado("5. Inventario Completo", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 6. Valor total del inventario
    try:
        r = requests.get(f"{BASE_URL}/api/inventario/valor-total")
        print_resultado("6. Valor Total del Inventario", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 7. Registrar entrada de inventario
    try:
        data = {
            "producto_id": producto_id,
            "tipo": "entrada",
            "cantidad": 5,
            "observacion": "Test de entrada",
            "usuario": "test_script"
        }
        r = requests.post(f"{BASE_URL}/api/inventario/movimientos", json=data)
        print_resultado("7. Registrar Entrada de Inventario", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 8. Historial de movimientos
    try:
        r = requests.get(f"{BASE_URL}/api/inventario/movimientos?limite=5")
        print_resultado("8. Últimos 5 Movimientos", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 9. Registrar una venta (obtener precio del producto primero)
    try:
        r_producto = requests.get(f"{BASE_URL}/api/productos/{producto_id}")
        if r_producto.status_code == 200:
            producto_data = r_producto.json()
            precio = producto_data['precio_actual']
            
            data = {
                "producto_id": producto_id,
                "cantidad_vendida": 1,
                "precio_venta": precio
            }
            r = requests.post(f"{BASE_URL}/api/ventas", json=data)
            print_resultado("9. Registrar Venta", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 10. Resumen de ventas del día
    try:
        r = requests.get(f"{BASE_URL}/api/ventas/resumen-dia")
        print_resultado("10. Resumen de Ventas del Día", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 11. Ventas por producto
    try:
        r = requests.get(f"{BASE_URL}/api/ventas/por-producto")
        print_resultado("11. Ventas por Producto", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    # 12. Top productos vendidos
    try:
        r = requests.get(f"{BASE_URL}/api/ventas/top-productos?limite=5")
        print_resultado("12. Top 5 Productos Vendidos", r)
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    print("\n" + "="*60)
    print("✅ TESTS COMPLETADOS")
    print("="*60)
    print("\nRevisa la documentación interactiva en:")
    print(f"   → {BASE_URL}/docs")
    print(f"   → {BASE_URL}/redoc")


if __name__ == "__main__":
    test_api()
