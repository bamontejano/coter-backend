// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// El secreto para verificar el token (debe coincidir con el usado en authController.js)
const JWT_SECRET = process.env.JWT_SECRET; 

// Middleware para proteger rutas
module.exports = (req, res, next) => {
    // 1. Obtener el token de la cabecera Authorization
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    // Extraer solo la parte del token
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verificar el token usando el secreto
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Adjuntar la info del usuario al request (esto es lo que usa therapistController)
        req.user = decoded; 
        
        // 4. Continuar con el controlador
        next();

    } catch (error) {
        // El token es inválido o ha expirado
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};