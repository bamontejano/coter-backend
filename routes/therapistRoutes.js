// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
// ⚠️ CORRECCIÓN: Importar las dos funciones protect y restrictTo
const { protect, restrictTo } = require('../middleware/auth'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL TERAPEUTA (Prefijo: /api/therapist)
// ----------------------------------------------------

// ⚠️ CRÍTICO: Aplicar ambos middlewares a todas las rutas de terapeuta
router.use(protect, restrictTo('THERAPIST'));

// 1. OBTENER PACIENTES ASIGNADOS 
router.get('/patients', therapistController.getPatients); 

// 2. ASIGNAR UN NUEVO PACIENTE 
router.patch('/assign', therapistController.assignPatient);

// 3. OBTENER PERFIL DE UN PACIENTE ESPECÍFICO
router.get('/patient/:patientId', therapistController.getPatientProfile); 

// 4. CREAR UN NUEVO OBJETIVO PARA UN PACIENTE
router.post('/goals', therapistController.createGoal); 

// 5. OBTENER TODOS LOS OBJETIVOS DE UN PACIENTE
router.get('/goals/:patientId', therapistController.getPatientGoals);

// ----------------------------------------------------

module.exports = router;