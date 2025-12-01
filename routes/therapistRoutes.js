// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL TERAPEUTA (Prefijo: /api/therapist)
// ----------------------------------------------------

// 1. OBTENER PACIENTES ASIGNADOS (Ya funcionando con lógica real)
router.get('/patients', authMiddleware, therapistController.getPatients); 

// 2. ASIGNAR UN NUEVO PACIENTE (PATCH para modificar el campo therapistId del paciente)
router.patch('/assign', authMiddleware, therapistController.assignPatient); // Cambiado a PATCH

// 3. OBTENER PERFIL DE UN PACIENTE ESPECÍFICO
router.get('/patient/:patientId', authMiddleware, therapistController.getPatientProfile); 

// 4. CREAR UN NUEVO OBJETIVO PARA UN PACIENTE
router.post('/goals', authMiddleware, therapistController.createGoal); 

// 5. OBTENER TODOS LOS OBJETIVOS DE UN PACIENTE
router.get('/goals/:patientId', authMiddleware, therapistController.getPatientGoals);

// ----------------------------------------------------

module.exports = router;