const express = require('express');

// Importar rutas
const clienteRoutes = require('./routes/clienteRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const productoRoutes = require('./routes/productoRoutes');
const vendedorRoutes = require('./routes/vendedorRoutes');
const vistaRoutes = require('./routes/vistaRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

const app = express();  // <-- app debe inicializarse antes de usarlo
const port = 3000;

// Middleware para archivos estáticos (html, css, js del frontend)
app.use(express.static('public'));

// Middleware para extraer rol del header 'x-role'
app.use((req, res, next) => {
  req.role = req.headers['x-role'] || 'vendedor'; 
  next();
});

// Middleware para formularios y JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la app
app.use('/clientes', clienteRoutes);
app.use('/ventas', ventasRoutes);
app.use('/productos', productoRoutes);
app.use('/vendedores', vendedorRoutes);
app.use('/vistas', vistaRoutes);
app.use('/auditoria', auditoriaRoutes);  // <-- Aquí va después de inicializar app

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en: http://localhost:${port}`);
});
