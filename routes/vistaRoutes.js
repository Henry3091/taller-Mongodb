const express = require('express');
const router = express.Router();
const { connectMongo } = require('../mongodb'); // tu función para conectar a Mongo

// Función para obtener datos según "vista" simulada en MongoDB
async function getViewData(req, res, viewName) {
  try {
    const db = await connectMongo();

    let resultado;

    switch(viewName) {
      case 'vista_productos_bajo_stock':
        // Productos con stock menor a 20 (ejemplo)
        resultado = await db.collection('productos').find({ stock: { $lt: 20 } }).toArray();
        break;

      case 'vista_ventas_cliente':
        // Ventas agrupadas por cliente con total (ejemplo)
        resultado = await db.collection('ventas').aggregate([
          {
            $group: {
              _id: "$cliente_id",
              totalVentas: { $sum: { $sum: "$detalle.subtotal" } }
            }
          }
        ]).toArray();
        break;

      case 'vista_ventas_con_total':
        // Ventas con campo total calculado (suma de subtotales)
        resultado = await db.collection('ventas').aggregate([
          {
            $addFields: {
              total: { $sum: "$detalle.subtotal" }
            }
          }
        ]).toArray();
        break;

      case 'vista_ventas_por_fecha':
        // Ventas ordenadas por fecha descendente
        resultado = await db.collection('ventas').find().sort({ fecha: -1 }).toArray();
        break;

      case 'vista_ventas_vendedor':
        // Ventas agrupadas por vendedor con total
        resultado = await db.collection('ventas').aggregate([
          {
            $group: {
              _id: "$vendedor_id",
              totalVentas: { $sum: { $sum: "$detalle.subtotal" } }
            }
          }
        ]).toArray();
        break;

      default:
        return res.status(400).json({ error: 'Vista no reconocida' });
    }

    res.json(resultado);

  } catch (error) {
    console.error(`Error al obtener datos de la vista ${viewName}:`, error);
    res.status(500).json({ error: 'Error en consulta' });
  }
}

router.get('/productos-bajo-stock', (req, res) => getViewData(req, res, 'vista_productos_bajo_stock'));
router.get('/ventas-cliente', (req, res) => getViewData(req, res, 'vista_ventas_cliente'));
router.get('/ventas-con-total', (req, res) => getViewData(req, res, 'vista_ventas_con_total'));
router.get('/ventas-por-fecha', (req, res) => getViewData(req, res, 'vista_ventas_por_fecha'));
router.get('/ventas-vendedor', (req, res) => getViewData(req, res, 'vista_ventas_vendedor'));

module.exports = router;
