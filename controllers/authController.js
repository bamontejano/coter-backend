// controllers/authController.js

const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
// 1. Importar e inicializar Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// El secreto para firmar tus tokens (se obtiene de process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET; 

// ----------------------------------------------------
// 1. FUNCIÓN DE REGISTRO (exports.register)
// ----------------------------------------------------

exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        // Validaciones básicas
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // 2. Verificar si el usuario ya existe usando Prisma
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });
        
        if (existingUser) {
            return res.status(409).json({ message: 'El usuario con este email ya existe.' });
        }

        // 3. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Crear el nuevo usuario en la DB (Neon) usando Prisma
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'PATIENT' // Asigna el rol, por defecto PATIENT
            }
        });

        // 5. Generar JWT para iniciar sesión inmediatamente
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // El token expira en 1 día
        );

        // 6. Respuesta exitosa
        res.status(201).json({ 
            message: 'Registro exitoso. Bienvenido.',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        // Si el error es de Prisma o de conexión, se capturará aquí
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    } finally {
        // Asegurarse de desconectar Prisma después de cada operación
        await prisma.$disconnect();
    }
};

// ----------------------------------------------------
// 2. FUNCIÓN DE LOGIN (exports.login)
// ----------------------------------------------------

exports.login = async (req, res) => {
    // Si la función de login aún no está implementada
    res.status(501).json({ message: 'Ruta de login no implementada.' });
    
    // Deberías implementar la lógica de login con Prisma y bcrypt.compare aquí.
    await prisma.$disconnect(); // Asegúrate de desconectar al final
};
// ... (El resto de tus funciones)