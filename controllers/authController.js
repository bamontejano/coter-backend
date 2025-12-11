// controllers/authController.js (VERSION FINAL - BLINDADA CONTRA ERRORES 500)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
const bcrypt = require('bcrypt'); // Usamos 'bcrypt' ya que resolvimos la dependencia
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'TU_SECRETO_JWT_ULTRA_SEGURO'; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';

const signToken = (id, role) => { 
    return jwt.sign({ id, role }, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN
    });
};

// =========================================================================
// 1. REGISTRO (POST /api/auth/register)
// =========================================================================
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione nombre, email y contraseña.' });
    }
    
    const allowedRoles = ['PATIENT', 'THERAPIST'];
    // Aseguramos que el rol sea válido o por defecto PATIENT
    const finalRole = role && allowedRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT'; 

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(), 
                password: hashedPassword,
                role: finalRole, 
                // 🚨 CRÍTICO: No incluimos 'therapistId' aquí. Si tu esquema de Prisma lo requiere,
                // la falla está en el esquema (debe ser nullable: therapistId String?).
            },
            select: { id: true, name: true, email: true, role: true }
        });

        const token = signToken(newUser.id, newUser.role);

        res.status(201).json({ 
            status: 'success', 
            token,
            user: newUser 
        });

    } catch (error) {
        // Manejo de error de email duplicado (P2002)
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            return res.status(400).json({ message: 'Este email ya está en uso.' });
        }
        
        // Manejo de errores de Prisma (P1000 - P2000)
        if (error.code && error.code.startsWith('P')) {
            console.error(`Error de Prisma (${error.code}) en registro:`, error.message);
            // Retornamos un 500 con el detalle del error de la DB
            return res.status(500).json({ 
                message: 'Error interno del servidor al registrar. (Posible error de esquema/BD)',
                details: error.message
            });
        }

        console.error("Error desconocido en el registro:", error.message, error.stack);
        // Retornamos un 500 genérico si no es un error de Prisma
        res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    }
};

// ... (El resto de la función exports.login)
// exports.login = async (req, res) => { ... }