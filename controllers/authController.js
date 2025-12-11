// controllers/authController.js (VERSIÓN FINAL Y SIN ERRORES DE SINTAXIS)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
const bcrypt = require('bcrypt'); // Usamos 'bcrypt' ya que resolvimos la dependencia
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'TU_SECRETO_JWT_ULTRA_SEGURO'; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '90d';

// Función helper para generar el token JWT
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
    const finalRole = role && allowedRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT'; 

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(), 
                password: hashedPassword,
                role: finalRole, 
            },
            select: { id: true, name: true, email: true, role: true }
        });

        const token = signToken(newUser.id, newUser.role);

        return res.status(201).json({ 
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
            return res.status(401).json({ message: 'Credenciales inválidas (usuario no encontrado).' });
        }
        
        // Protegemos contra user.password = null
        const isPasswordCorrect = await bcrypt.compare(password, user.password || ''); 

        if (!isPasswordCorrect) {
             return res.status(401).json({ message: 'Credenciales inválidas (contraseña incorrecta).' });
        }

        const token = signToken(user.id, user.role);

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({ // Aseguramos el 'return'
            status: 'success',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Error FATAL en el inicio de sesión (DB/Bcrypt):", error.message, error.stack);
        return res.status(500).json({ // Aseguramos el 'return'
            message: 'Error interno del servidor al iniciar sesión. (Verifique logs de dependencias)',
            details: error.message
        });
    }
};