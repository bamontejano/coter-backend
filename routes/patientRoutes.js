// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

// RUTAS PROTEGIDAS POR AUTH MIDDLEWARE
// Todas las rutas del paciente deben usar el authMiddleware para obtener req.user.id

// 1. OBTENER PERFIL PROPIO: GET /api/patient/me
router.get('/me', authMiddleware, patientController.getPatientProfile);

// 2. OBTENER OBJETIVOS ASIGNADOS: GET /api/patient/goals
router.get('/goals', authMiddleware, patientController.getGoals);

// 3. REGISTRAR UN CHECK-IN DE ESTADO: POST /api/patient/checkin
router.post('/checkin', authMiddleware, patientController.createCheckIn);

// 4. (Opcional) ACTUALIZAR EL ESTADO DE UN OBJETIVO: PATCH /api/patient/goals/:goalId
router.patch('/goals/:goalId', authMiddleware, patientController.updateGoalStatus); 

module.exports = router;