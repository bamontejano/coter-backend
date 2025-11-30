// routes/authRoutes.js

const express = require('express');
const router = express.Router();

// ----------------------------------------------------
// IMPORTACIONES
// ----------------------------------------------------

// Importamos el controlador que contiene la lógica para las rutas de autenticación
// NOTA: Asegúrate de que la ruta a tu controlador sea correcta (ej: ../controllers/authController)
const authController = require('../controllers/authController'); 

// Importamos un middleware de autenticación (si tienes uno). 
// Si no tienes este archivo, deberías comentarlo o asegurarte de que exista.
// const authMiddleware = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// DEFINICIÓN DE RUTAS (PRUEBA DE AISLAMIENTO)
// ----------------------------------------------------

// 1. Ruta de REGISTRO (POST /api/auth/register)
// /*
// router.post('/register', authController.register);
// */

// 2. Ruta de LOGIN (POST /api/auth/login) - ¡DEJAMOS ESTA ACTIVA!
// Esta es la ruta que estamos probando para resolver el error "Failed to fetch".
router.post('/login', authController.login); 


// 3. Ruta de VERIFICACIÓN de Sesión (GET /api/auth/verify)
// /*
// router.get('/verify', authMiddleware, authController.verifyToken);
// */


// 4. Ruta para obtener un Perfil de Usuario (GET /api/auth/me)
// /*
// router.get('/me', authMiddleware, authController.getMe);
// */


// ----------------------------------------------------
// EXPORTACIÓN
// ----------------------------------------------------

module.exports = router;