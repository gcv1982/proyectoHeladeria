require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');

(async () => {
  try {
    console.log('📋 Verificando usuarios...');
    const result = await db.query('SELECT id, email, rol FROM usuarios');
    console.log('✅ Usuarios encontrados:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('ℹ️  No hay usuarios. Creando usuarios de demo...');
      
      const hashAdmin = await bcrypt.hash('admin123', 10);
      const hashVendedor = await bcrypt.hash('vend123', 10);
      
      await db.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
        ['Administrador', 'admin@heladeria.com', hashAdmin, 'admin']
      );
      console.log('✅ Usuario admin creado: admin@heladeria.com / admin123');
      
      await db.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
        ['Vendedor Demo', 'vendedor@heladeria.com', hashVendedor, 'vendedor']
      );
      console.log('✅ Usuario vendedor creado: vendedor@heladeria.com / vend123');
      
      console.log('\n📝 Usuarios creados exitosamente');
    }
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
