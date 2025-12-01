// controllers/authController.js

const prisma = require('../utils/prismaClient'); // Asegúrate de que esta ruta sea correcta
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Para usar process.env.JWT_SECRET

// Función auxiliar para generar el token JWT
const generateToken = (userId, userRole) => {
    return jwt.sign(
        { id: userId, role: userRole },
        process.env.JWT_SECRET, // Asegúrate de definir esta variable en tu .env
        { expiresIn: '1d' }
    );
};

// ----------------------------------------------------
// 1. REGISTRO DE USUARIO (POST /api/auth/register)
// ----------------------------------------------------
exports.register = async (req, res) => {
    const { email, password, firstName, role } = req.body;

    if (!email || !password || !firstName || !role) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el registro.' });
    }

    try {
        // 1. Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Crear el usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                role
            },
            // Selecciona solo los campos seguros y necesarios para la respuesta
            select: {
                id: true,
                email: true,
                firstName: true,
                role: true,
                therapistId: true // Importante para el paciente
            }
        });

        // 4. Generar el token JWT
        const token = generateToken(newUser.id, newUser.role);

        // 5. Devolver 201 Created con el token y los datos (LA CORRECCIÓN CLAVE)
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Error en el registro:', error.message);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

// ----------------------------------------------------
// 2. INICIO DE SESIÓN (POST /api/auth/login)
// ----------------------------------------------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Se requieren correo y contraseña.' });
    }

    try {
        // 1. Buscar usuario
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 2. Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Generar token
        const token = generateToken(user.id, user.role);

        // 4. Devolver 200 OK con el token y los datos
        // NOTA: No devolvemos el hash de la contraseña (user.password)
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                role: user.role,
                therapistId: user.therapistId
            }
        });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
        res.status(500).json({ message: 'Error interno del servidor durante el inicio de sesión.' });
    }
};