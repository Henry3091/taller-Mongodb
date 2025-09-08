// routes/clientes.js
const express = require('express');
const router = express.Router();
const { connectMongo } = require('../mongodb'); // conexión Mongo central

// GET /clientes/listar
router.get('/listar', async (req, res) => {
  try {
    const db = await connectMongo();
    const clientes = await db.collection('clientes').find({}).toArray();
    res.json(clientes);
  } catch (error) {
    console.error('[MongoDB] Error al listar clientes:', error);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
});

// POST /clientes/insertar
router.post('/insertar', async (req, res) => {
  const { nombre, email, telefono } = req.body;

  // Validación simple
  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const db = await connectMongo();

    // Opcional: puedes generar un _id numérico incremental si lo estás controlando tú
    const ultimo = await db.collection('clientes').find().sort({ _id: -1 }).limit(1).toArray();
    const nuevoId = ultimo.length ? ultimo[0]._id + 1 : 1;

    await db.collection('clientes').insertOne({
      _id: nuevoId,
      nombre,
      email,
      telefono
    });

    res.json({ mensaje: 'Cliente insertado correctamente en MongoDB' });
  } catch (error) {
    console.error('[MongoDB] Error al insertar cliente:', error);
    res.status(500).json({ error: 'Error al insertar cliente' });
  }
});
// PUT /clientes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono } = req.body;

  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const db = await connectMongo();
    const resultado = await db.collection('clientes').updateOne(
      { _id: parseInt(id) },
      { $set: { nombre, email, telefono } }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    console.error('[MongoDB] Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /clientes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectMongo();
    const resultado = await db.collection('clientes').deleteOne({ _id: parseInt(id) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('[MongoDB] Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});



module.exports = router;
