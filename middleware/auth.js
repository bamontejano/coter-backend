// middleware/auth.js (Archivo renombrado)

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

// Middleware principal para proteger rutas y adjuntar el usuario
exports.protect = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Adjuntar la info del usuario al request
        req.user = decoded; 
        
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para restringir el acceso a un rol específico
exports.restrictTo = (role) => (req, res, next) => {
    // Si el usuario no está autenticado o el rol no coincide
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado para esta ruta.' });
    }
    next();
};