// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
// ⚠️ Asegúrate de que este archivo existe y tiene las funciones exportadas
const patientController = require('../controllers/patientController'); 
// ✅ CORRECCIÓN: Importación del middleware con el nombre de archivo correcto
const { protect, restrictTo } = require('../middleware/auth');

// ----------------------------------------------------
// RUTAS DE ACCESO AL PACIENTE (Prefijo: /api/patient)
// ----------------------------------------------------

// 🛡️ SEGURIDAD: Aplicar autenticación y restricción de rol a TODAS las rutas de este router
router.use(protect, restrictTo('PATIENT'));

// 1. OBTENER PERFIL DEL PACIENTE (Dashboard)
// Esta función debe obtener los detalles del paciente logueado (incluyendo therapistId)
router.get('/profile', patientController.getProfile); 

// 2. OBTENER METAS ASIGNADAS
router.get('/goals', patientController.getGoals); 

// 3. ENVIAR UN CHECK-IN DIARIO
// La función del controlador debe crear un registro de check-in en la DB
router.post('/checkin', patientController.submitCheckin);

// 4. OBTENER TAREAS ASIGNADAS (assignments)
router.get('/assignments', patientController.getAssignments); 

// ----------------------------------------------------

module.exports = router;