// controllers/authController.js

const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
// ⚠️ Si usas un archivo centralizado (EJEMPLO: ../utils/prismaClient):
// const prisma = require('../utils/prismaClient'); 
// O si no lo has centralizado aún:
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // <--- Usaremos esta versión por simplicidad

// El secreto para firmar tus tokens (debe cargarse desde las variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET; 

// ----------------------------------------------------
// 1. FUNCIÓN DE REGISTRO (exports.register)
// ... (Tu código de registro, que ya funciona, se queda igual)
// ----------------------------------------------------
exports.register = async (req, res) => {
    // ... (código de registro que ya funciona)
};


// ----------------------------------------------------
// 2. FUNCIÓN DE LOGIN (exports.login) - ¡LA PARTE CORREGIDA!
// ----------------------------------------------------

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
        }

        // 1. Buscar usuario por email en Neon
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // 2. Verificar si el usuario existe
        if (!user) {
            // Usamos un mensaje genérico por seguridad
            return res.status(401).json({ message: 'Credenciales inválidas: Usuario no encontrado.' });
        }

        // 3. Comparar la contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas: Contraseña incorrecta.' });
        }

        // 4. Generar JWT
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // 5. Respuesta exitosa
        res.status(200).json({ 
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    } finally {
        // En un entorno de desarrollo con hot-reloading, esto puede ser problemático.
        // En producción (Render), asegúrate de que el cliente se desconecte.
        // Si usaste la inicialización centralizada (../utils/prismaClient), puedes omitir esta línea
        // await prisma.$disconnect(); 
    }
};

// ... (Resto de tus funciones, como verifyToken, getMe, etc.)