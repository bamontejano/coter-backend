// controllers/authController.js (VERSION FINAL Y SINCRONIZADA CON SCHEMA.PRISMA)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
const bcrypt = require('bcrypt');
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
    // 🚨 CORRECCIÓN: Extraemos firstName y lastName para que coincidan con index.html
    const { firstName, lastName, email, password, role } = req.body; 

    // Usamos firstName como validación, ya que el esquema lo requiere.
    if (!firstName || !email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione nombre, email y contraseña.' });
    }
    
    const allowedRoles = ['PATIENT', 'THERAPIST'];
    const finalRole = role && allowedRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT'; 

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                // 🚨 CRÍTICO: Solo pasamos firstName, ya que el esquema no tiene 'name' ni 'lastName'.
                firstName: firstName, 
                email: email.toLowerCase(), 
                password: hashedPassword,
                role: finalRole, 
            },
            select: { id: true, firstName: true, email: true, role: true } // Devolvemos firstName
        });

        const token = signToken(newUser.id, newUser.role);

        // 🚨 CORRECCIÓN: Devolvemos el objeto user limpio
        return res.status(201).json({ 
            status: 'success', 
            token,
            user: {
                id: newUser.id,
                name: newUser.firstName, // Usamos firstName como el 'name' de la respuesta para el frontend
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            return res.status(400).json({ message: 'Este email ya está en uso.' });
        }
        
        // Muestra el error de base de datos específico (Pxxxx)
        if (error.code && error.code.startsWith('P')) {
            console.error(`Error de Prisma (${error.code}) en registro:`, error.message);
            return res.status(500).json({ 
                message: 'Error interno del servidor al registrar. (Posible error de esquema/BD)',
                details: error.message
            });
        }

        console.error("Error desconocido en el registro:", error.message, error.stack);
        return res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    }
};

// =========================================================================
// 2. INICIO DE SESIÓN (POST /api/auth/login)
// =========================================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione email y contraseña.' });
    }
    
    const lowerCaseEmail = email.toLowerCase();

    try {
        const user = await prisma.user.findUnique({
            where: { email: lowerCaseEmail }
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password || ''); 

        if (!isPasswordCorrect) {
             return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = signToken(user.id, user.role);

        const userResponse = {
            id: user.id,
            name: user.firstName, // Usamos firstName como el 'name' de la respuesta para el frontend
            email: user.email,
            role: user.role
        };

        return res.status(200).json({
            status: 'success',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Error FATAL en el inicio de sesión:", error.message, error.stack);
        return res.status(500).json({
            message: 'Error interno del servidor al iniciar sesión.',
            details: error.message
        });
    }
};