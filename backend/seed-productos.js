
// Script para poblar la tabla de productos con los datos iniciales
const db = require('./db');

const productos = [
  // ========== GRANEL ==========
  { nombre: '1/4 kg', precio_unitario: 4000, categoria: 'GRANEL' },
  { nombre: '1/2 kg', precio_unitario: 7000, categoria: 'GRANEL' },
  { nombre: '1 kg', precio_unitario: 12000, categoria: 'GRANEL' },
  { nombre: 'Yogurt', precio_unitario: 2300, categoria: 'GRANEL' },
  { nombre: 'Helado s/Az', precio_unitario: 2300, categoria: 'GRANEL' },
  { nombre: 'Postre Veg', precio_unitario: 2300, categoria: 'GRANEL' },

  // ========== BATIDOS ==========
  { nombre: 'Batido', precio_unitario: 3600, categoria: 'BATIDOS' },
  { nombre: 'Batido Nesquik', precio_unitario: 4000, categoria: 'BATIDOS' },
  { nombre: 'Sundae Go', precio_unitario: 3500, categoria: 'BATIDOS' },
  { nombre: 'Smoothie', precio_unitario: 3900, categoria: 'BATIDOS' },

  // ========== POSTRES ==========
  { nombre: 'Almendrado x1', precio_unitario: 1500, categoria: 'POSTRES' },
  { nombre: 'Almendrado x8', precio_unitario: 9000, categoria: 'POSTRES' },
  { nombre: 'Cassatta x1', precio_unitario: 1500, categoria: 'POSTRES' },
  { nombre: 'Cassatta x8', precio_unitario: 9000, categoria: 'POSTRES' },
  { nombre: 'Crocante x1', precio_unitario: 1500, categoria: 'POSTRES' },
  { nombre: 'Crocante x8', precio_unitario: 10800, categoria: 'POSTRES' },
  { nombre: 'Frutezza x1', precio_unitario: 1500, categoria: 'POSTRES' },
  { nombre: 'Frutezza x8', precio_unitario: 10800, categoria: 'POSTRES' },
  { nombre: 'Suizo x1', precio_unitario: 1600, categoria: 'POSTRES' },
  { nombre: 'Suizo x8', precio_unitario: 11900, categoria: 'POSTRES' },
  { nombre: 'Escocés x1', precio_unitario: 1700, categoria: 'POSTRES' },
  { nombre: 'Escocés x8', precio_unitario: 12500, categoria: 'POSTRES' },
  { nombre: 'Alfajor Secreto x1', precio_unitario: 2200, categoria: 'POSTRES' },
  { nombre: 'Alfajor Secreto x8', precio_unitario: 12500, categoria: 'POSTRES' },
  { nombre: 'Crocantino', precio_unitario: 9000, categoria: 'POSTRES' },
  { nombre: 'Delicias', precio_unitario: 9000, categoria: 'POSTRES' },

  // ========== TENTACIONES ==========
  { nombre: 'Chocolate', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Crema Americana', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Crema Cookie', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Dulce de Leche', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Dulce de Leche Granizado', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Frutilla', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Granizado', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Limón', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Menta Granizado', precio_unitario: 7500, categoria: 'TENTACIONES' },
  { nombre: 'Vainilla', precio_unitario: 7500, categoria: 'TENTACIONES' },

  // ========== CUCURUCHOS ==========
  { nombre: '1 Bocha', precio_unitario: 2200, categoria: 'CUCURUCHOS' },
  { nombre: '2 Bochas', precio_unitario: 2900, categoria: 'CUCURUCHOS' },
  { nombre: '3 Bochas', precio_unitario: 3200, categoria: 'CUCURUCHOS' },
  { nombre: 'GRIDO 2 Bochas', precio_unitario: 3100, categoria: 'CUCURUCHOS' },
  { nombre: 'GRIDO 3 Bochas', precio_unitario: 3500, categoria: 'CUCURUCHOS' },
  { nombre: 'Super Gridito', precio_unitario: 2300, categoria: 'CUCURUCHOS' },

  // ========== PALITOS ==========
  { nombre: 'Palito Bombón x1', precio_unitario: 800, categoria: 'PALITOS' },
  { nombre: 'Palito Bombón x10', precio_unitario: 6800, categoria: 'PALITOS' },
  { nombre: 'Palito Bombón x20', precio_unitario: 13600, categoria: 'PALITOS' },
  { nombre: 'Palito Cremoso x1', precio_unitario: 700, categoria: 'PALITOS' },
  { nombre: 'Palito Cremoso x10', precio_unitario: 5300, categoria: 'PALITOS' },
  { nombre: 'Palito Cremoso x20', precio_unitario: 10500, categoria: 'PALITOS' },
  { nombre: 'Palito Frutal x1', precio_unitario: 600, categoria: 'PALITOS' },
  { nombre: 'Palito Frutal x10', precio_unitario: 4800, categoria: 'PALITOS' },
  { nombre: 'Palito Frutal x20', precio_unitario: 9500, categoria: 'PALITOS' },

  // ========== TORTAS ==========
  { nombre: 'Torta Frutilla', precio_unitario: 13500, categoria: 'TORTAS' },
  { nombre: 'Torta Grido', precio_unitario: 13500, categoria: 'TORTAS' },
  { nombre: 'Torta Oreo', precio_unitario: 13500, categoria: 'TORTAS' },

  // ========== FAMILIARES ==========
  { nombre: 'Familiar nro 1', precio_unitario: 13900, categoria: 'FAMILIARES' },
  { nombre: 'Familiar nro 2', precio_unitario: 13900, categoria: 'FAMILIARES' },
  { nombre: 'Familiar nro 3', precio_unitario: 13900, categoria: 'FAMILIARES' },
  { nombre: 'Familiar nro 4', precio_unitario: 13900, categoria: 'FAMILIARES' },

  // ========== PIZZAS ==========
  { nombre: 'Pizza Mozzarella', precio_unitario: 5600, categoria: 'PIZZAS' },
  { nombre: 'Pizza Jamón', precio_unitario: 5900, categoria: 'PIZZAS' },
  { nombre: 'Pizza Cebolla', precio_unitario: 5600, categoria: 'PIZZAS' },
  { nombre: 'Pizza Casera', precio_unitario: 7800, categoria: 'PIZZAS' },
  { nombre: 'Mini Pizza', precio_unitario: 2900, categoria: 'PIZZAS' },
  { nombre: 'Bastones', precio_unitario: 5100, categoria: 'PIZZAS' },
  { nombre: 'Pechugas', precio_unitario: 5100, categoria: 'PIZZAS' },
  { nombre: 'Empanadas', precio_unitario: 7800, categoria: 'PIZZAS' },

  // ========== EXTRAS ==========
  { nombre: 'Baño de Chocolate', precio_unitario: 500, categoria: 'EXTRAS' },
  { nombre: 'Blister x3', precio_unitario: 800, categoria: 'EXTRAS' },
  { nombre: 'Topping x1', precio_unitario: 550, categoria: 'EXTRAS' },
  { nombre: 'Topping x2', precio_unitario: 1000, categoria: 'EXTRAS' },
  { nombre: 'Salsita 15gr', precio_unitario: 550, categoria: 'EXTRAS' },
  { nombre: 'Bengala Común', precio_unitario: 600, categoria: 'EXTRAS' },
  { nombre: 'Bengala Brillo', precio_unitario: 1000, categoria: 'EXTRAS' },
  { nombre: 'Block 38gr', precio_unitario: 1400, categoria: 'EXTRAS' },
  { nombre: 'Block 110gr', precio_unitario: 4200, categoria: 'EXTRAS' },
  { nombre: 'Block 170gr', precio_unitario: 7000, categoria: 'EXTRAS' },
  { nombre: 'Block 300gr', precio_unitario: 10800, categoria: 'EXTRAS' },
  { nombre: 'Graffiti 45gr', precio_unitario: 1500, categoria: 'EXTRAS' },
  { nombre: 'Roclets 40gr', precio_unitario: 1400, categoria: 'EXTRAS' },
  { nombre: 'Maní c/Choco', precio_unitario: 1100, categoria: 'EXTRAS' },
  { nombre: 'Cofler Tofi/Bon', precio_unitario: 800, categoria: 'EXTRAS' },
  { nombre: 'Cofler 55gr', precio_unitario: 2700, categoria: 'EXTRAS' },
  { nombre: 'Gelatinas', precio_unitario: 700, categoria: 'EXTRAS' },

  // ========== BEBIDAS ==========
  { nombre: 'Gaseosa 1.5lt', precio_unitario: 0, categoria: 'BEBIDAS' },
  { nombre: 'Gaseosa 500ml', precio_unitario: 1700, categoria: 'BEBIDAS' },
  { nombre: 'Lata', precio_unitario: 1400, categoria: 'BEBIDAS' },
  { nombre: 'Baggio', precio_unitario: 700, categoria: 'BEBIDAS' },
  { nombre: 'Agua 500ml', precio_unitario: 1000, categoria: 'BEBIDAS' },
  { nombre: 'Agua 2lt', precio_unitario: 2000, categoria: 'BEBIDAS' },

  // ========== PROMOCIONES ==========
  { nombre: '2 de 2 Bochas', precio_unitario: 5500, categoria: 'PROMOCIONES' },
  { nombre: '2 de 1/4', precio_unitario: 7500, categoria: 'PROMOCIONES' },
  { nombre: 'kg + medio', precio_unitario: 17500, categoria: 'PROMOCIONES' },
  { nombre: '2 Kilos', precio_unitario: 22000, categoria: 'PROMOCIONES' },
  { nombre: '2 Bocha TOY', precio_unitario: 3900, categoria: 'PROMOCIONES' },
  { nombre: '3x2 Alm o Cas', precio_unitario: 19000, categoria: 'PROMOCIONES' },
  { nombre: '2 Escocés', precio_unitario: 23000, categoria: 'PROMOCIONES' },
  { nombre: 'Kilo Reutilizable', precio_unitario: 20000, categoria: 'PROMOCIONES' },
  { nombre: 'Recarga Kilo', precio_unitario: 10800, categoria: 'PROMOCIONES' },
  { nombre: 'Promo Navidad', precio_unitario: 20000, categoria: 'PROMOCIONES' },

  // ========== SIN TACC ==========
  // (agregar productos sin TACC aquí cuando corresponda)

  // ========== CHOCOLATES ==========
  // (agregar chocolates aquí cuando corresponda)
];

const seedProductos = async () => {
  try {
    console.log('🔧 Verificando tabla de productos...');
    const existentes = await db.query('SELECT COUNT(*) as count FROM productos');
    const count = parseInt(existentes.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Ya existen ${count} productos en la BD. No se insertarán duplicados.`);
      console.log('   Si querés forzar la inserción, ejecutá primero: DELETE FROM productos;');
      process.exit(0);
    }

    console.log(`📦 Insertando ${productos.length} productos...`);

    for (const p of productos) {
      await db.query(
        'INSERT INTO productos (nombre, precio_unitario, categoria) VALUES ($1, $2, $3)',
        [p.nombre, p.precio_unitario, p.categoria]
      );
    }

    console.log(`✅ ${productos.length} productos insertados correctamente.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar productos:', error);
    process.exit(1);
  }
};

seedProductos();
