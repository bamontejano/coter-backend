// middleware/auth.js (CORREGIDO)

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// 🚨 CORRECCIÓN CRÍTICA: Usar el mismo secreto de fallback que en authController.js
const JWT_SECRET = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025'; 

const prisma = new PrismaClient(); 

// =========================================================================
// MIDDLEWARE DE PROTECCIÓN DE RUTAS (JWT)
// =========================================================================

exports.protect = async (req, res, next) => {
    // 1. Obtener el token del header (ej: Authorization: Bearer <token>)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No ha iniciado sesión.' });
    }

    try {
        // 2. Verificar el token usando el secreto correcto
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Buscar el usuario en la BD para asegurarse de que existe y obtener datos frescos
        const freshUser = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!freshUser) {
            return res.status(401).json({ message: 'El usuario asociado al token no existe.' });
        }

        // 4. Asignar el usuario (objeto completo de Prisma) al request
        req.user = freshUser; 
        
        next();

    } catch (error) {
        // Manejo de errores de JWT (ej. Token inválido o expirado)
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// =========================================================================
// MIDDLEWARE DE RESTRICCIÓN POR ROL
// =========================================================================

exports.restrictTo = (role) => (req, res, next) => {
    // req.user ya está definido por el middleware protect (con el objeto completo del usuario)
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado para esta ruta.' });
    }
    next();
};