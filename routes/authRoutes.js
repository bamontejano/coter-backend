// routes/authRoutes.js

const express = require('express');
const router = express.Router();

// ----------------------------------------------------
// IMPORTACIONES
// ----------------------------------------------------

// Importamos el controlador que contiene la lógica para las rutas de autenticación
const authController = require('../controllers/authController');

// Importamos el middleware de autenticación (Necesario para rutas protegidas, si lo tienes)
const { protect } = require('../middleware/auth'); 

// ----------------------------------------------------
// DEFINICIÓN DE RUTAS (API /api/auth)
// ----------------------------------------------------

// 1. Ruta de REGISTRO (POST /api/auth/register)
// ⭐ CORRECCIÓN: Esta línea debe estar activa.
router.post('/register', authController.register);


// 2. Ruta de LOGIN (POST /api/auth/login)
router.post('/login', authController.login);


// 3. Ruta de VERIFICACIÓN de Sesión (GET /api/auth/verify)
/*
router.get('/verify', authMiddleware, authController.verifyToken);
*/


// 4. Ruta para obtener un Perfil de Usuario (GET /api/auth/me)
/*
router.get('/me', authMiddleware, authController.getMe);
*/


// ----------------------------------------------------
// EXPORTACIÓN
// ----------------------------------------------------

module.exports = router;