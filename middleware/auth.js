// middleware/auth.js (VERSIÓN ROBUSTA FINAL CON PRISMA)

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const JWT_SECRET = process.env.JWT_SECRET; 
const prisma = new PrismaClient(); 

// Middleware principal para proteger rutas y adjuntar el usuario
exports.protect = async (req, res, next) => { // 🚨 AHORA ASÍNCRONO
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 🚨 CRÍTICO: BUSCAR EL USUARIO COMPLETO EN LA BD (Prisma)
        const freshUser = await prisma.user.findUnique({ where: { id: decoded.id } });
        
        if (!freshUser) {
            return res.status(401).json({ message: 'El usuario asociado al token ya no existe.' });
        }
        
        // Adjuntar el objeto completo del usuario
        req.user = freshUser; 
        
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