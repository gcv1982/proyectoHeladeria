
const jwt = require('jsonwebtoken');

const claveSecreta = 'clave_super_secreta_heladeria'; // debe coincidir con tu middleware
const payload = {
  id: 1, // ID del usuario
  rol: 'admin' // o 'empleado', según lo que necesites
};

const token = jwt.sign(payload, claveSecreta, { expiresIn: '1h' });

console.log('🔐 Token generado:\n');
console.log(token);
