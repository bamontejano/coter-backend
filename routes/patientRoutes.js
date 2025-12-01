// routes/patientRoutes.js

const express = require('express');
const router = express.Router();

// Importación del controlador y el middleware
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

// ----------------------------------------------------
// RUTAS PROTEGIDAS POR AUTH MIDDLEWARE (Prefijo: /api/patient)
// ----------------------------------------------------

// 1. OBTENER PERFIL PROPIO
router.get('/me', authMiddleware, patientController.getPatientProfile);

// 2. OBJETIVOS
router.get('/goals', authMiddleware, patientController.getGoals);
// Para actualizar el estado de un objetivo
router.patch('/goals/:goalId', authMiddleware, patientController.updateGoalStatus);

// 3. REGISTRAR UN CHECK-IN DE ESTADO
router.post('/checkin', authMiddleware, patientController.createCheckIn);

// 4. TAREAS (ASIGNACIONES)
router.get('/assignments', authMiddleware, patientController.getAssignments);
// Para actualizar el estado de una tarea (e.g., a "completed")
router.patch('/assignments/:assignmentId', authMiddleware, patientController.updateAssignmentStatus);

// 5. MENSAJERÍA
router.get('/messages', authMiddleware, patientController.getMessages);
router.post('/messages', authMiddleware, patientController.sendMessage);

module.exports = router;