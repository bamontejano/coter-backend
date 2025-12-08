// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
// 🚨 CORRECCIÓN: Se asume que el archivo es 'auth.js' y exporta protect/restrictTo
const { protect, restrictTo } = require('../middleware/auth'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL PACIENTE (Prefijo: /api/patient)
// ----------------------------------------------------

// Aplica el middleware de autenticación y restricción de rol a TODAS las rutas del paciente
// Así te aseguras de que solo un PATIENT pueda acceder a ellas.
router.use(protect, restrictTo('PATIENT'));

// 1. Crear un nuevo Check-in
router.post('/checkin', patientController.createCheckin); 

// 2. Obtener todas las metas asignadas al paciente
router.get('/goals', patientController.getAssignedGoals); 

// ----------------------------------------------------

module.exports = router;