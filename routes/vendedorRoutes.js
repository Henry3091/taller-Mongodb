// routes/vendedores.js
const express = require('express');
const router = express.Router();
const { connectMongo } = require('../mongodb'); // asegúrate de tener esta función

// POST /vendedores/insertar
router.post('/insertar', async (req, res) => {
  const { nombre, correo } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  try {
    const db = await connectMongo();

    // Generar un _id manual como número, igual que hiciste en tus colecciones anteriores
    const ultimo = await db.collection('vendedores').find().sort({ _id: -1 }).limit(1).toArray();
    const nuevoId = ultimo.length ? ultimo[0]._id + 1 : 1;

    await db.collection('vendedores').insertOne({
      _id: nuevoId,
      nombre,
      correo
    });

    res.json({ mensaje: 'Vendedor insertado correctamente en MongoDB' });
  } catch (error) {
    console.error('[MongoDB] Error al insertar vendedor:', error);
    res.status(500).json({ error: 'Error al insertar vendedor' });
  }
});

// GET /vendedores/listar
router.get('/listar', async (req, res) => {
  try {
    const db = await connectMongo();
    const vendedores = await db.collection('vendedores').find({}).toArray();

    const vendedoresFormateados = vendedores.map(v => ({
      _id: v._id,
      nombre: v.nombre,
      email: v.correo
    }));

    res.json(vendedoresFormateados);
  } catch (error) {
    console.error('[MongoDB] Error al listar vendedores:', error);
    res.status(500).json({ error: 'Error al listar vendedores' });
  }
});

// PUT /vendedores/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const db = await connectMongo();
    const resultado = await db.collection('vendedores').updateOne(
      { _id: parseInt(id) },
      { $set: { nombre, correo: email } }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }

    res.json({ mensaje: 'Vendedor actualizado correctamente' });
  } catch (error) {
    console.error('[MongoDB] Error al actualizar vendedor:', error);
    res.status(500).json({ error: 'Error al actualizar vendedor' });
  }
});

// DELETE /vendedores/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectMongo();
    const resultado = await db.collection('vendedores').deleteOne({ _id: parseInt(id) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }

    res.json({ mensaje: 'Vendedor eliminado correctamente' });
  } catch (error) {
    console.error('[MongoDB] Error al eliminar vendedor:', error);
    res.status(500).json({ error: 'Error al eliminar vendedor' });
  }
});



module.exports = router;
