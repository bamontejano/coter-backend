// middleware/auth.js

const jwt = require('jsonwebtoken');
// 🚨 CRÍTICO: Importar Prisma para buscar al usuario
const { PrismaClient } = require('@prisma/client');

// 🚨 CRÍTICO: Definir un fallback para el secreto si no está en las variables de entorno.
const JWT_SECRET = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025'; 

const prisma = new PrismaClient(); 

// =========================================================================
// MIDDLEWARE DE PROTECCIÓN DE RUTAS (JWT)
// =========================================================================

exports.protect = async (req, res, next) => {
    // 1. Obtener el token del header (ej: Authorization: Bearer <token>)
    let token;
    // Se busca en el header 'Authorization' con el formato 'Bearer <token>'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No ha iniciado sesión.' });
    }

    try {
        // 2. Verificar el token usando el secreto (JWT_SECRET)
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Buscar el usuario en la BD (para asegurar que existe y obtener el objeto completo)
        const freshUser = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!freshUser) {
            return res.status(401).json({ message: 'El usuario asociado al token ya no existe.' });
        }

        // 4. Asignar el usuario (objeto completo de Prisma) al request
        // Esto garantiza que req.user.id esté disponible para patientController.
        req.user = freshUser; 
        
        next();

    } catch (error) {
        // Maneja errores de JWT (ej. Token inválido o expirado)
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// =========================================================================
// MIDDLEWARE DE RESTRICCIÓN POR ROL
// =========================================================================

exports.restrictTo = (role) => (req, res, next) => {
    // Si el usuario no está autenticado o el rol no coincide
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ message: 'Acceso denegado. Rol no autorizado para esta ruta.' });
    }
    next();
};