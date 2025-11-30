// controllers/authController.js

const bcrypt = require('bcryptjs'); // Usado para hashear contraseñas
const jwt = require('jsonwebtoken'); // Usado para generar tokens JWT

// ⚠️ AJUSTAR RUTA: Asegúrate de que esta ruta a tu servicio de DB es correcta.
const dbService = require('../db/dbService'); 

// El secreto para firmar tus tokens (debe cargarse desde las variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET; 

// ----------------------------------------------------
// 1. FUNCIÓN DE REGISTRO (exports.register)
// ----------------------------------------------------

exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        // Validaciones básicas (puedes añadir más si es necesario)
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // 1. Verificar si el usuario ya existe en Neon
        const existingUser = await dbService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El usuario con este email ya existe.' });
        }

        // 2. Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear el nuevo usuario en la DB (Neon)
        const newUser = await dbService.createUser({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            // Por defecto, usa el rol enviado en el body. Si es para terapeutas, asegúrate de que el frontend envíe 'THERAPIST'.
            role: role || 'PATIENT' 
        });

        // 4. Generar JWT para iniciar sesión inmediatamente
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // El token expira en 1 día
        );

        // 5. Respuesta exitosa
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
        // Muestra el error en la consola de Render
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};

// ----------------------------------------------------
// 2. FUNCIÓN DE LOGIN (exports.login)
// ----------------------------------------------------

exports.login = async (req, res) => {
    // ⚠️ IMPLEMENTAR LÓGICA DE LOGIN AQUÍ
    // La lógica de login buscaría al usuario por email, compararía la contraseña hasheada (bcrypt.compare) 
    // y si es correcta, devolvería un token JWT.
    
    // Ejemplo de placeholder (REEMPLAZAR CON TU LÓGICA REAL)
    res.status(501).json({ message: 'Ruta de login no implementada.' });
};

// ----------------------------------------------------
// 3. OTRAS FUNCIONES (VERIFY, GETME, etc.)
// ----------------------------------------------------

// Funciones de ejemplo que puedes añadir:
/*
exports.verifyToken = (req, res) => {
    // ... lógica para verificar el token
    res.json({ valid: true, user: req.user });
};

exports.getMe = async (req, res) => {
    // ... lógica para obtener los datos del usuario por su ID
    res.json({ user: req.user });
};
*/