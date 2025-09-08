// routes/auditoria.js
const express = require('express');
const router = express.Router();
const { connectMongo } = require('../mongodb'); // Ajusta el path si es necesario

// Clientes (Auditoría)
router.get('/clientes', async (req, res) => {
  try {
    const db = await connectMongo();
    const clientes = await db.collection('clientes')
      .find({})
      .sort({ _id: -1 }) // orden inverso como ORDER BY fecha DESC
      .toArray();

    res.json(clientes);
  } catch (error) {
    console.error('[MongoDB] Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Productos (Auditoría)
router.get('/productos', async (req, res) => {
  try {
    const db = await connectMongo();
    const productos = await db.collection('productos')
      .find({})
      .sort({ _id: -1 }) // orden inverso (si usas un campo "fecha", cámbialo aquí)
      .toArray();

    res.json(productos);
  } catch (error) {
    console.error('[MongoDB] Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

module.exports = router;
