// routes/patientRoutes.js (FINALIZADO)

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
// Asegúrate de que el path al middleware de auth sea correcto
const { protect, restrictTo } = require('../middleware/auth'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL PACIENTE (Prefijo: /api/patient)
// ----------------------------------------------------

// Aplica el middleware de autenticación y restricción de rol
router.use(protect, restrictTo('PATIENT'));

// 1. Crear un nuevo Check-in
router.post('/checkin', patientController.createCheckin); 

// 2. Obtener todas las metas asignadas al paciente
router.get('/goals', patientController.getAssignedGoals); 

// 3. Obtener historial de Check-ins (PARA EL GRÁFICO)
router.get('/checkins', patientController.getHistoricalCheckins); 

// ----------------------------------------------------

module.exports = router;