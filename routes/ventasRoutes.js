const express = require('express');
const router = express.Router();
const { connectMongo } = require('../mongodb');
const { Decimal128 } = require('mongodb');

// Registrar venta (sin detalles)
router.post('/registrar', async (req, res) => {
  const { fecha, cliente_id, vendedor_id } = req.body;
  if (!fecha || !cliente_id || !vendedor_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    const db = await connectMongo();
    const ultimo = await db.collection('ventas').find().sort({ _id: -1 }).limit(1).toArray();
    const nuevoId = ultimo.length ? ultimo[0]._id + 1 : 1;
    await db.collection('ventas').insertOne({
      _id: nuevoId,
      fecha: new Date(fecha),
      cliente_id,
      vendedor_id,
      detalle: []
    });
    res.json({ mensaje: 'Venta registrada correctamente', venta_id: nuevoId });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

// Insertar detalle de venta
router.post('/detalle/insertar', async (req, res) => {
  const { venta_id, producto_id, cantidad, subtotal } = req.body;
  if (venta_id == null || producto_id == null || cantidad == null || subtotal == null) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    const db = await connectMongo();
    const producto = await db.collection('productos').findOne({ _id: producto_id });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    if (producto.stock < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });
    const update = await db.collection('ventas').updateOne(
      { _id: venta_id },
      { $push: { detalle: { producto_id, cantidad, subtotal: Decimal128.fromString(subtotal.toString()) } } }
    );
    if (update.matchedCount === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    await db.collection('productos').updateOne(
      { _id: producto_id },
      { $inc: { stock: -cantidad } }
    );
    res.json({ mensaje: 'Detalle agregado y stock actualizado' });
  } catch (error) {
    console.error('Error al insertar detalle de venta:', error);
    res.status(500).json({ error: 'Error al insertar detalle de venta' });
  }
});

// Registrar venta completa
router.post('/venta-completa', async (req, res) => {
  const { fecha, cliente_id, vendedor_id, detalles } = req.body;
  if (!fecha || cliente_id == null || vendedor_id == null || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Faltan datos o detalles inválidos' });
  }
  try {
    const db = await connectMongo();
    const ultimo = await db.collection('ventas').find().sort({ _id: -1 }).limit(1).toArray();
    const nuevoId = ultimo.length ? ultimo[0]._id + 1 : 1;
    for (const det of detalles) {
      if (det.producto_id == null || det.cantidad == null || det.subtotal == null) {
        return res.status(400).json({ error: 'Detalles incompletos' });
      }
      const producto = await db.collection('productos').findOne({ _id: det.producto_id });
      if (!producto) return res.status(404).json({ error: `Producto ${det.producto_id} no encontrado` });
      if (producto.stock < det.cantidad) return res.status(400).json({ error: `Stock insuficiente producto ${det.producto_id}` });
    }
    await db.collection('ventas').insertOne({
      _id: nuevoId,
      fecha: new Date(fecha),
      cliente_id,
      vendedor_id,
      detalle: detalles.map(det => ({
        producto_id: det.producto_id,
        cantidad: det.cantidad,
        subtotal: Decimal128.fromString(det.subtotal.toString())
      }))
    });
    for (const det of detalles) {
      await db.collection('productos').updateOne(
        { _id: det.producto_id },
        { $inc: { stock: -det.cantidad } }
      );
    }
    res.json({ mensaje: 'Venta completa registrada y stock actualizado' });
  } catch (error) {
    console.error('Error al registrar venta completa:', error);
    res.status(500).json({ error: 'Error al registrar venta completa' });
  }
});

// ------------- NUEVA RUTA -------------
router.get('/vistas/ventas-cliente', async (req, res) => {
  try {
    const db = await connectMongo();
    const ventas = await db.collection('ventas').aggregate([
      { $unwind: "$detalle" },
      {
        $lookup: {
          from: 'clientes',
          localField: 'cliente_id',
          foreignField: '_id',
          as: 'cliente_info'
        }
      },
      { $unwind: "$cliente_info" },
      {
        $project: {
          cliente: "$cliente_info.nombre",
          fecha: "$fecha",
          producto_id: "$detalle.producto_id",
          cantidad: "$detalle.cantidad",
          subtotal: "$detalle.subtotal"
        }
      }
    ]).toArray();

    res.json(ventas);
  } catch (error) {
    console.error('Error en vista ventas-cliente:', error);
    res.status(500).json({ error: 'Error al obtener ventas por cliente' });
  }
});

module.exports = router;
