// middleware/authMiddleware.js - TEMPORAL MOCK

// Este middleware de prueba simplemente llama a next() y pasa la petición.
exports.protect = (req, res, next) => {
    // Asumimos que el token 'FAKE_TOKEN_FOR_TESTING' es válido después del login de prueba.
    // Podemos simular que el ID del usuario está en el request para evitar más fallos.
    req.user = { id: 'THERAPIST_123', role: 'THERAPIST' }; 
    next(); 
};

// En tu therapistRoutes.js, asegúrate de importarlo así:
// const { protect } = require('../middleware/authMiddleware');
// y usarlo así: router.get('/patients', protect, therapistController.getPatients);

// Pero si lo importaste como 'const authMiddleware = require(...)'
// en therapistRoutes.js, el nombre de la función exportada debe coincidir:
// Si usas 'authMiddleware' en therapistRoutes.js, define:
module.exports = (req, res, next) => {
    req.user = { id: 'THERAPIST_123', role: 'THERAPIST' }; 
    next(); 
};