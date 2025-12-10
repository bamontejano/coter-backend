// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🚨 CRÍTICO: Asegúrate de que JWT_SECRET exista en tus variables de entorno en Render
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

    // Validación básica de campos
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, proporcione nombre, email y contraseña.' });
    }
    
    // 🚨 CORRECCIÓN CRÍTICA: Validamos el rol y usamos PATIENT por defecto.
    const allowedRoles = ['PATIENT', 'THERAPIST'];
    const finalRole = role && allowedRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT'; 

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(), // 🚨 CRÍTICO: Almacenar email en minúsculas
                password: hashedPassword,
                role: finalRole, 
                therapistId: finalRole === 'PATIENT' ? undefined : null, // Opcional: solo para pacientes. 'undefined' omite el campo si no es paciente.
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
        // Manejar error de email duplicado (código de error de Prisma)
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
            return res.status(400).json({ message: 'Este email ya está en uso.' });
        }
        console.error("Error en el registro:", error.message);
        res.status(500).json({ message: 'Error interno del servidor al registrar.' });
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

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() } // 🚨 CRÍTICO: Buscar email en minúsculas
        });

        // 1. Verificar si el usuario existe y si la contraseña es correcta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 2. Generar y enviar token
        const token = signToken(user.id, user.role);

        // Retornar información del usuario sin la contraseña
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.status(200).json({
            status: 'success',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Error en el inicio de sesión:", error.message);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
};