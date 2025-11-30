// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();

// 1. Importación del controlador (ahora que lo hemos creado/modificado)
const therapistController = require('../controllers/therapistController');

// 2. Importación del middleware de autenticación (¡CRUCIAL!)
// Si no tienes este archivo, necesitarás crearlo temporalmente, ver la NOTA.
const authMiddleware = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// RUTAS DE ACCESO AL TERAPEUTA (Solo la de pacientes activa)
// ----------------------------------------------------

// 1. OBTENER PACIENTES ASIGNADOS: GET /api/therapist/patients (ACTIVA)
router.get('/patients', authMiddleware, therapistController.getPatients);


// 2. ASIGNAR UN NUEVO PACIENTE: POST /api/therapist/assign (COMENTADA)
// router.post('/assign', authMiddleware, therapistController.assignPatient);

// ... Resto de rutas (checkins, goals, etc.) COMENTADAS ...


// ----------------------------------------------------

module.exports = router;