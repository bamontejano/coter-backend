// middleware/auth.js (CORREGIDO DEFINITIVO)

const jwt = require('jsonwebtoken');
// 🚨 CRÍTICO: Importar Prisma para buscar al usuario
const { PrismaClient } = require('@prisma/client');

// 🚨 CRÍTICO: Definir un fallback para el secreto
const JWT_SECRET = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025'; 

const prisma = new PrismaClient(); 

// =========================================================================
// MIDDLEWARE DE PROTECCIÓN DE RUTAS (JWT)
// =========================================================================

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // Detiene la ejecución aquí con 401
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        // 1. Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 2. Buscar el usuario en la BD (para obtener el objeto completo y asegurar que existe)
        const freshUser = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!freshUser) {
            // Detiene la ejecución aquí con 401
            return res.status(401).json({ message: 'El usuario asociado al token ya no existe.' });
        }

        // 3. Adjuntar el objeto completo del usuario.
        req.user = freshUser; 
        
        next(); // Continúa al patientController

    } catch (error) {
        // Maneja errores de JWT (ej. Token inválido o expirado)
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// =========================================================================
// MIDDLEWARE DE RESTRICCIÓN POR ROL
// =========================================================================

exports.restrictTo = (role) => (req, res, next) => {
    // Si req.user fue establecido por 'protect' pero el rol no coincide
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado para esta ruta.' });
    }
    next();
};