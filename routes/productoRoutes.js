const express = require('express');
const router = express.Router();
const { connectMongo } = require('../mongodb');
const { Decimal128 } = require('mongodb');

// POST /productos/insertar
router.post('/insertar', async (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ error: 'Faltan campos: nombre, precio o stock' });
  }

  try {
    const db = await connectMongo();

    const ultimo = await db.collection('productos').find().sort({ _id: -1 }).limit(1).toArray();
    const nuevoId = ultimo.length ? ultimo[0]._id + 1 : 1;

    await db.collection('productos').insertOne({
      _id: nuevoId,
      nombre,
      precio: Decimal128.fromString(parseFloat(precio).toFixed(2)),
      stock: parseInt(stock, 10)
    });

    res.json({ mensaje: 'Producto insertado correctamente en MongoDB' });
  } catch (error) {
    console.error('[MongoDB] Error al insertar producto:', error);
    res.status(500).json({ error: 'Error al insertar producto' });
  }
});

// GET /productos/listar
router.get('/listar', async (req, res) => {
  try {
    const db = await connectMongo();
    const productos = await db.collection('productos').find().toArray();

    // Convertir Decimal128 a número
    const productosFormateados = productos.map(p => ({
      _id: p._id,
      nombre: p.nombre,
      precio: parseFloat(p.precio?.toString() ?? '0.00'), // 🔧 CORREGIDO AQUÍ
      stock: p.stock
    }));

    res.json(productosFormateados);
  } catch (error) {
    console.error('[MongoDB] Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});
// PUT /productos/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const db = await connectMongo();
    const resultado = await db.collection('productos').updateOne(
      { _id: parseInt(id) },
      {
        $set: {
          nombre,
          precio: Decimal128.fromString(parseFloat(precio).toFixed(2)),
          stock: parseInt(stock, 10)
        }
      }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('[MongoDB] Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /productos/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectMongo();
    const resultado = await db.collection('productos').deleteOne({ _id: parseInt(id) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('[MongoDB] Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});



module.exports = router;
