// middleware/auth.js (FINAL)

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Asegurar un fallback para el secreto
const JWT_SECRET = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025'; 

const prisma = new PrismaClient(); 

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Buscar el usuario en la BD para obtener el objeto completo y verificar que existe
        const freshUser = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!freshUser) {
            return res.status(401).json({ message: 'El usuario asociado al token ya no existe.' });
        }

        // Adjuntar el objeto completo del usuario.
        req.user = freshUser; 
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

exports.restrictTo = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado para esta ruta.' });
    }
    next();
};