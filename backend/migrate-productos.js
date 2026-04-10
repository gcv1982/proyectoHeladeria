
// Migración: adaptar tabla productos para el sistema POS
require('dotenv').config();
const db = require('./db');

const productos = [
  // GRANEL
  { nombre: '1/4 kg', precio_unitario: 4500, categoria: 'GRANEL' },
  { nombre: '1/2 kg', precio_unitario: 7800, categoria: 'GRANEL' },
  { nombre: '1 kg', precio_unitario: 13500, categoria: 'GRANEL' },
  // BATIDOS
  { nombre: 'Batido', precio_unitario: 3800, categoria: 'BATIDOS' },
  { nombre: 'Batido Nesquik', precio_unitario: 4200, categoria: 'BATIDOS' },
  { nombre: 'Sundae Go', precio_unitario: 3700, categoria: 'BATIDOS' },
  { nombre: 'Smoothie', precio_unitario: 4100, categoria: 'BATIDOS' },
  // SIN TACC
  { nombre: 'Yogurt', precio_unitario: 2600, categoria: 'SIN TACC' },
  { nombre: 'Helado s/Az', precio_unitario: 2600, categoria: 'SIN TACC' },
  { nombre: 'Postre Veg', precio_unitario: 2600, categoria: 'SIN TACC' },
  // POSTRES
  { nombre: 'Almendrado x1', precio_unitario: 1600, categoria: 'POSTRES' },
  { nombre: 'Almendrado x 8', precio_unitario: 9500, categoria: 'POSTRES' },
  { nombre: 'Cassatta x 1', precio_unitario: 1600, categoria: 'POSTRES' },
  { nombre: 'Cassatta x 8', precio_unitario: 9500, categoria: 'POSTRES' },
  { nombre: 'Crocante x 1', precio_unitario: 1600, categoria: 'POSTRES' },
  { nombre: 'Crocante x 8', precio_unitario: 11000, categoria: 'POSTRES' },
  { nombre: 'Frutezza x 1', precio_unitario: 1600, categoria: 'POSTRES' },
  { nombre: 'Frutezza x 8', precio_unitario: 11000, categoria: 'POSTRES' },
  { nombre: 'Suizo x 1', precio_unitario: 1700, categoria: 'POSTRES' },
  { nombre: 'Suizo x 8', precio_unitario: 12000, categoria: 'POSTRES' },
  { nombre: 'Escocés x 1', precio_unitario: 1800, categoria: 'POSTRES' },
  { nombre: 'Escocés x 8', precio_unitario: 12500, categoria: 'POSTRES' },
  { nombre: 'Alfajor Secreto x 1', precio_unitario: 2200, categoria: 'POSTRES' },
  { nombre: 'Alfajor Secreto x 6', precio_unitario: 12500, categoria: 'POSTRES' },
  { nombre: 'Crocantino', precio_unitario: 9500, categoria: 'POSTRES' },
  { nombre: 'Delicias', precio_unitario: 9500, categoria: 'POSTRES' },
  // TENTACIONES
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
  // CUCURUCHOS
  { nombre: '1 Bocha', precio_unitario: 2400, categoria: 'CUCURUCHOS' },
  { nombre: '2 Bochas', precio_unitario: 3100, categoria: 'CUCURUCHOS' },
  { nombre: '3 Bochas', precio_unitario: 3400, categoria: 'CUCURUCHOS' },
  { nombre: 'GRIDO 2 Bochas', precio_unitario: 3300, categoria: 'CUCURUCHOS' },
  { nombre: 'GRIDO 3 Bochas', precio_unitario: 3700, categoria: 'CUCURUCHOS' },
  { nombre: 'Super Gridito', precio_unitario: 2500, categoria: 'CUCURUCHOS' },
  // PALITOS
  { nombre: 'Palito Bombón x1', precio_unitario: 1000, categoria: 'PALITOS' },
  { nombre: 'Palito Bombón x10', precio_unitario: 7000, categoria: 'PALITOS' },
  { nombre: 'Palito Bombón x20', precio_unitario: 14000, categoria: 'PALITOS' },
  { nombre: 'Palito Cremoso x1', precio_unitario: 900, categoria: 'PALITOS' },
  { nombre: 'Palito Cremoso x10', precio_unitario: 5500, categoria: 'PALITOS' },
  { nombre: 'Palito Cremoso x20', precio_unitario: 11000, categoria: 'PALITOS' },
  { nombre: 'Palito Frutal x1', precio_unitario: 800, categoria: 'PALITOS' },
  { nombre: 'Palito Frutal x10', precio_unitario: 5000, categoria: 'PALITOS' },
  { nombre: 'Palito Frutal x20', precio_unitario: 10000, categoria: 'PALITOS' },
  // TORTAS
  { nombre: 'Torta Frutilla', precio_unitario: 14000, categoria: 'TORTAS' },
  { nombre: 'Torta Grido', precio_unitario: 14000, categoria: 'TORTAS' },
  { nombre: 'Torta Oreo', precio_unitario: 14000, categoria: 'TORTAS' },
  // FAMILIARES
  { nombre: 'Familiar nro 1', precio_unitario: 14500, categoria: 'FAMILIARES' },
  { nombre: 'Familiar nro 2', precio_unitario: 14500, categoria: 'FAMILIARES' },
  { nombre: 'Familiar nro 3', precio_unitario: 14500, categoria: 'FAMILIARES' },
  { nombre: 'Familiar nro 4', precio_unitario: 14500, categoria: 'FAMILIARES' },
  // PIZZAS
  { nombre: 'Pizza Mozzarella', precio_unitario: 5800, categoria: 'PIZZAS' },
  { nombre: 'Pizza Jamón', precio_unitario: 6200, categoria: 'PIZZAS' },
  { nombre: 'Pizza Cebolla', precio_unitario: 5800, categoria: 'PIZZAS' },
  { nombre: 'Pizza Casera', precio_unitario: 8200, categoria: 'PIZZAS' },
  { nombre: 'Mini Pizza', precio_unitario: 3100, categoria: 'PIZZAS' },
  { nombre: 'Bastones', precio_unitario: 5300, categoria: 'PIZZAS' },
  { nombre: 'Pechugas', precio_unitario: 5300, categoria: 'PIZZAS' },
  { nombre: 'Empanadas', precio_unitario: 7800, categoria: 'PIZZAS' },
  // EXTRAS
  { nombre: 'Baño de Chocolate', precio_unitario: 600, categoria: 'EXTRAS' },
  { nombre: 'Blister x3', precio_unitario: 1000, categoria: 'EXTRAS' },
  { nombre: 'Topping x1', precio_unitario: 550, categoria: 'EXTRAS' },
  { nombre: 'Topping x2', precio_unitario: 1000, categoria: 'EXTRAS' },
  { nombre: 'Salsita 15gr', precio_unitario: 550, categoria: 'EXTRAS' },
  { nombre: 'Bengala Común', precio_unitario: 600, categoria: 'EXTRAS' },
  { nombre: 'Bengala Brillo', precio_unitario: 1000, categoria: 'EXTRAS' },
  // CHOCOLATES
  { nombre: 'Block 38gr', precio_unitario: 1400, categoria: 'CHOCOLATES' },
  { nombre: 'Block 110gr', precio_unitario: 4200, categoria: 'CHOCOLATES' },
  { nombre: 'Block 170gr', precio_unitario: 7000, categoria: 'CHOCOLATES' },
  { nombre: 'Block 300gr', precio_unitario: 10800, categoria: 'CHOCOLATES' },
  { nombre: 'Graffiti 45gr', precio_unitario: 1500, categoria: 'CHOCOLATES' },
  { nombre: 'Roclets 40gr', precio_unitario: 1400, categoria: 'CHOCOLATES' },
  { nombre: 'Maní c/Choco', precio_unitario: 1100, categoria: 'CHOCOLATES' },
  { nombre: 'Cofler Tofi/Bon', precio_unitario: 800, categoria: 'CHOCOLATES' },
  { nombre: 'Cofler 55gr', precio_unitario: 2700, categoria: 'CHOCOLATES' },
  { nombre: 'Gelatinas', precio_unitario: 700, categoria: 'CHOCOLATES' },
  // BEBIDAS
  { nombre: 'Gaseosa 1.5lt', precio_unitario: 0, categoria: 'BEBIDAS' },
  { nombre: 'Gaseosa 500ml', precio_unitario: 2000, categoria: 'BEBIDAS' },
  { nombre: 'Lata', precio_unitario: 1700, categoria: 'BEBIDAS' },
  { nombre: 'Baggio', precio_unitario: 800, categoria: 'BEBIDAS' },
  { nombre: 'Agua 500ml', precio_unitario: 1000, categoria: 'BEBIDAS' },
  { nombre: 'Agua 2lt', precio_unitario: 2000, categoria: 'BEBIDAS' },
  // PROMOCIONES
  { nombre: '2 de 2 Bochas', precio_unitario: 6000, categoria: 'PROMOCIONES' },
  { nombre: '2 de 1/4', precio_unitario: 8500, categoria: 'PROMOCIONES' },
  { nombre: 'kg + medio', precio_unitario: 19800, categoria: 'PROMOCIONES' },
  { nombre: '2 Kilos', precio_unitario: 25000, categoria: 'PROMOCIONES' },
  { nombre: '2 Bocha TOY', precio_unitario: 4100, categoria: 'PROMOCIONES' },
  { nombre: '3x2 Alm o Cas', precio_unitario: 19000, categoria: 'PROMOCIONES' },
  { nombre: '2 Escocés', precio_unitario: 23000, categoria: 'PROMOCIONES' },
  { nombre: 'Kilo Reutilizable', precio_unitario: 22500, categoria: 'PROMOCIONES' },
  { nombre: 'Recarga Kilo', precio_unitario: 12200, categoria: 'PROMOCIONES' },
  { nombre: 'Recarga Medio kilo', precio_unitario: 7000, categoria: 'PROMOCIONES' },
];

const migrate = async () => {
  try {
    console.log('🔧 Iniciando migración de tabla productos...');

    // 1. Recrear la tabla productos con la estructura correcta para el POS
    console.log('⏳ Recreando tabla productos (estructura POS)...');
    await db.query(`DROP TABLE IF EXISTS productos CASCADE`);
    await db.query(`
      CREATE TABLE productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        presentacion VARCHAR(100),
        precio_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
        categoria VARCHAR(50),
        observaciones VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla productos recreada');

    // 2. Insertar todos los productos
    console.log(`📦 Insertando ${productos.length} productos...`);
    for (const p of productos) {
      await db.query(
        'INSERT INTO productos (nombre, precio_unitario, categoria) VALUES ($1, $2, $3)',
        [p.nombre, p.precio_unitario, p.categoria]
      );
    }
    console.log(`✅ ${productos.length} productos insertados`);

    // 3. Verificar
    const result = await db.query('SELECT categoria, COUNT(*) as total FROM productos GROUP BY categoria ORDER BY categoria');
    console.log('\n📊 Productos por categoría:');
    result.rows.forEach(r => console.log(`   ${r.categoria}: ${r.total} productos`));

    console.log('\n✅ Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
};

migrate();
