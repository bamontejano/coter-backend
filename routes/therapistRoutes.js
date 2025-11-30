// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();

// 1. Importación del controlador
const therapistController = require('../controllers/therapistController');

// 2. Importación del middleware de autenticación (¡Mantenemos la importación, pero no la usamos en la ruta!)
const authMiddleware = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL TERAPEUTA (Prefijo: /api/therapist)
// ----------------------------------------------------

// 1. OBTENER PACIENTES ASIGNADOS: GET /api/therapist/patients 
// ⚠️ IMPORTANTE: Desactivamos el authMiddleware para aislar el fallo de JSON.parse.
//    Si esto funciona, el problema está en authMiddleware.js.
router.get('/patients', therapistController.getPatients); 


// 2. ASIGNAR UN NUEVO PACIENTE: POST /api/therapist/assign (COMENTADA)
/*
router.post('/assign', authMiddleware, therapistController.assignPatient);
*/

// 3. OBTENER PERFIL DEL PACIENTE: GET /api/therapist/patient/:id (COMENTADA)
/*
router.get('/patient/:id', authMiddleware, therapistController.getPatientProfile);
*/

// ----------------------------------------------------

module.exports = router;