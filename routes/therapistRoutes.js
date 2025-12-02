// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
// ✅ CORRECCIÓN: Importación del middleware con el nombre de archivo correcto
const { protect, restrictTo } = require('../middleware/auth'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL TERAPEUTA (Prefijo: /api/therapist)
// ----------------------------------------------------

// 🛡️ SEGURIDAD: Aplicar autenticación y restricción de rol a TODAS las rutas de este router
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