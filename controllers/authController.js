// authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🚨 IMPORTANTE: Ajusta la ruta a tu cliente de Prisma
const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------
// REGISTRO DE USUARIO (PACIENTE O TERAPEUTA)
// RUTA: /api/auth/register
// ----------------------------------------------------
exports.register = async (req, res) => {
    try {
        const { email, password, firstName, role } = req.body;

        // 1. Validación de campos obligatorios
        if (!email || !password || !firstName || !role) {
            return res.status(400).json({ message: 'Todos los campos (email, contraseña, nombre y rol) son obligatorios.' });
        }
        
        // 2. Comprobar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // 3. Hashing de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Creación del usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                // CRÍTICO: El 'role' debe coincidir con el ENUM de Prisma (PATIENT/THERAPIST)
                role: role, 
                // therapistId se mantiene como null a menos que lo asignes explícitamente aquí
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                role: true,
                therapistId: true,
            }
        });
        
        // 5. Generación del Token JWT
        const token = jwt.sign(
            { userId: newUser.id, role: newUser.role },
            process.env.JWT_SECRET || 'mi_secreto_seguro', // 🚨 Usar variable de entorno real
            { expiresIn: process.env.JWT_LIFETIME || '1d' }
        );

        // 6. Respuesta exitosa
        res.status(201).json({ 
            token, 
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                role: newUser.role,
                therapistId: newUser.therapistId
            }
        });

    } catch (error) {
        // 7. Manejo y log de errores
        console.error("❌ Error en el registro de usuario:", error);
        
        // El error 500 aparecerá ahora en los logs de Render
        res.status(500).json({ message: 'Error interno del servidor. No se pudo completar el registro.' });
    }
};

// ----------------------------------------------------
// INICIO DE SESIÓN DE USUARIO
// RUTA: /api/auth/login
// ----------------------------------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validación de campos
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, proporciona email y contraseña.' });
        }

        // 2. Buscar usuario
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Comparar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 4. Generación del Token JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'mi_secreto_seguro', // 🚨 Usar variable de entorno real
            { expiresIn: process.env.JWT_LIFETIME || '1d' }
        );

        // 5. Respuesta exitosa
        res.status(200).json({
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                role: user.role,
                therapistId: user.therapistId,
            }
        });

    } catch (error) {
        // 6. Manejo y log de errores
        console.error("❌ Error en el inicio de sesión:", error);
        res.status(500).json({ message: 'Error interno del servidor. No se pudo iniciar sesión.' });
    }
};