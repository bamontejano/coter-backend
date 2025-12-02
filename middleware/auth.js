// middleware/auth.js (RECOMENDADO renombrar el archivo)

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
        
        // El payload del JWT es { userId, role, ... }
        req.user = decoded; 
        
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para restringir el acceso a un rol específico
exports.restrictTo = (role) => (req, res, next) => {
    // ⚠️ CRÍTICO: El rol se lee de req.user, que fue adjuntado por 'exports.protect'
    if (req.user && req.user.role === role) {
        next();
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado para esta ruta.' });
    }
};