// controllers/authController.js

// ⚠️ CORRECCIÓN CRÍTICA: Cambiado de 'bcrypt' a 'bcryptjs'
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient'); 
const { Role } = require('@prisma/client'); // Importamos el Enum Role

// El secreto usado para firmar y verificar los tokens (debe estar en tu .env)
const JWT_SECRET = process.env.JWT_SECRET; 
const JWT_EXPIRES_IN = '1d'; // Token expira en 1 día

// ----------------------------------------------------------------------
// 1. REGISTRO DE NUEVO USUARIO (POST /api/auth/register)
// ----------------------------------------------------------------------

exports.register = async (req, res) => {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: email, password y rol.' });
    }
    
    // Aseguramos que el rol sea uno de los válidos
    if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ message: 'Rol inválido.' });
    }

    try {
        // 1. Encriptar la contraseña
        // Usamos saltRounds = 10 (estándar seguro)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Crear el usuario en la base de datos
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role,
                firstName: firstName || null,
                lastName: lastName || null,
            }
        });

        // 3. Generar token
        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            } 
        });

    } catch (error) {
        // Manejar el error de email duplicado de Prisma
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Este email ya está registrado.' });
        }
        console.error("Error en registro:", error.message);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

// ----------------------------------------------------------------------
// 2. INICIO DE SESIÓN (POST /api/auth/login)
// ----------------------------------------------------------------------

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Generar token
        const token = jwt.sign(
            { userId: user.id, role: user.role, id: user.id }, // ID duplicado para compatibilidad
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(200).json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            } 
        });

    } catch (error) {
        console.error("Error en login:", error.message);
        res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión.' });
    }
};