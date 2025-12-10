// routes/patientRoutes.js (FINAL)

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/auth'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL PACIENTE (Prefijo: /api/patient)
// ----------------------------------------------------

// Aplica el middleware de autenticación y restricción de rol a TODAS las rutas
router.use(protect, restrictTo('PATIENT'));

// 1. Crear un nuevo Check-in (POST)
router.post('/checkin', patientController.createCheckin); 

// 2. Obtener todas las metas asignadas al paciente (GET)
router.get('/goals', patientController.getAssignedGoals); 

// 3. Obtener historial de Check-ins (GET) ⬅️ LÍNEA DE LA RUTA PROBLEMA
router.get('/checkins', patientController.getHistoricalCheckins); 

// ----------------------------------------------------

module.exports = router;