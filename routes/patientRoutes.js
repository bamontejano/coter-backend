// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL PACIENTE (Prefijo: /api/patient)
// ----------------------------------------------------

// 1. Crear un nuevo Check-in (Solo accesible por el paciente)
router.post('/checkin', authMiddleware, patientController.createCheckin); 

// 2. Obtener todas las metas asignadas al paciente
router.get('/goals', authMiddleware, patientController.getAssignedGoals); 

// ----------------------------------------------------

module.exports = router;