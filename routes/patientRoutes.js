// routes/patientRoutes.js (VERIFICADO)

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController'); // LÍNEA 3
const { protect, restrictTo } = require('../middleware/auth'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL PACIENTE (Prefijo: /api/patient)
// ----------------------------------------------------

router.use(protect, restrictTo('PATIENT'));

// 1. Crear un nuevo Check-in
router.post('/checkin', patientController.createCheckin); 

// 2. Obtener todas las metas asignadas al paciente
router.get('/goals', patientController.getAssignedGoals); // LÍNEA 17

// ----------------------------------------------------

module.exports = router;