/*
const mysql = require('mysql2/promise');

const users = {
  admin:    { user: 'admin1', password: 'pass123' },
  vendedor: { user: 'vendedor1', password: 'pass123' },
  analista: { user: 'analista1', password: 'pass123' },
  auditor:  { user: 'auditor1', password: 'pass123' },
};

// Guarda pools por rol para no crear muchos
const pools = {};

function getPoolForRole(role = 'vendedor') {
  if (!users[role]) {
    role = 'vendedor'; // rol por defecto si el que envían no existe
  }
  if (!pools[role]) {
    pools[role] = mysql.createPool({
      host: 'localhost',
      user: users[role].user,
      password: users[role].password,
      database: 'empresa_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pools[role];
}

module.exports = { getPoolForRole };
*/

// Función para avisar que MySQL está suspendido
function getPoolForRole(role) {
  throw new Error('Conexión MySQL suspendida temporalmente');
}

module.exports = { getPoolForRole };
