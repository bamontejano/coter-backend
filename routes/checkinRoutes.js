// routes/checkinRoutes.js (CONTENIDO TEMPORAL DE PRUEBA)

const express = require('express');
const router = express.Router();

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.send('Rutas de Check-ins cargadas correctamente.');
});

// Exporta el router
module.exports = router;