const db = require('./db');
const bcrypt = require('bcrypt');

const initDB = async () => {
  try {
    console.log('🔧 Inicializando base de datos...');

    // Crear tabla de usuarios
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'vendedor' CHECK (rol IN ('admin', 'vendedor', 'gerente')),
        estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios verificada');

    // Crear tabla de ventas
    await db.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10, 2) NOT NULL,
        items JSONB NOT NULL,
        pagos JSONB NOT NULL,
        descripcion VARCHAR(255),
        estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'cancelada', 'pendiente')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    // Crear índices para ventas
    await db.query(`CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado)`);
    console.log('✅ Tabla ventas verificada');

    // Crear tabla de retiros
    await db.query(`
      CREATE TABLE IF NOT EXISTS retiros (
        id SERIAL PRIMARY KEY,
        usuario_id INT,
        monto DECIMAL(10, 2) NOT NULL,
        descripcion VARCHAR(255),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
      )
    `);
    
    await db.query(`CREATE INDEX IF NOT EXISTS idx_retiros_fecha ON retiros(fecha)`);
    console.log('✅ Tabla retiros verificada');

    // Crear tabla de cajas
    await db.query(`
      CREATE TABLE IF NOT EXISTS cajas (
        id SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        monto_inicial DECIMAL(10, 2) NOT NULL,
        monto_cierre DECIMAL(10, 2),
        fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMP NULL,
        estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
        denominaciones_inicio JSONB,
        denominaciones_cierre JSONB,
        diferencia DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    await db.query(`CREATE INDEX IF NOT EXISTS idx_cajas_estado ON cajas(estado)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_cajas_fecha ON cajas(fecha_apertura)`);
    console.log('✅ Tabla cajas verificada');

    // Crear tabla de productos
    await db.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        presentacion VARCHAR(100),
        precio_unitario DECIMAL(10, 2) NOT NULL,
        categoria VARCHAR(50),
        observaciones VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla productos verificada');

    // Insertar usuarios iniciales de depuración
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashVendedor = await bcrypt.hash('vend123', 10);

    // Verificar si ya existen
    const usuariosExistentes = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const count = parseInt(usuariosExistentes.rows[0].count);

    if (count === 0) {
      await db.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@heladeria.com', hashAdmin, 'admin']
      );
      console.log('✅ Usuario admin creado');

      await db.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
        ['Vendedor Demo', 'vendedor@heladeria.com', hashVendedor, 'vendedor']
      );
      console.log('✅ Usuario vendedor creado');
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  }
};

module.exports = initDB;

