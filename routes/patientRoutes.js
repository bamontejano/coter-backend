// routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController'); 
const { protect, restrictTo } = require('../middleware/auth'); // Importación corregida

router.use(protect, restrictTo('PATIENT'));

// 1. OBTENER PERFIL DEL PACIENTE
router.get('/profile', patientController.getProfile); 

// 2. OBTENER METAS ASIGNADAS
router.get('/goals', patientController.getGoals); 

// 3. ENVIAR UN CHECK-IN DIARIO
router.post('/checkin', patientController.submitCheckin);

// 4. OBTENER TAREAS ASIGNADAS
router.get('/assignments', patientController.getAssignments); 

module.exports = router;