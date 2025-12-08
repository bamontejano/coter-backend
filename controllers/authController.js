// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Función helper para generar el token JWT
const signToken = id => {
    // CORRECCIÓN: Usar un valor de emergencia si JWT_SECRET no está definido en Render.
    const secret = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    
    return jwt.sign({ id }, secret, {
        expiresIn: expiresIn
    });
};

// =========================================================================
// 1. REGISTRO DE USUARIO (POST /api/auth/register)
// =========================================================================
exports.register = async (req, res) => {
    // 🚨 CAMBIO: Incluir lastName en la desestructuración.
    const { firstName, lastName, email, password, role, invitationCode } = req.body;

    // 🚨 CAMBIO: Validar también el apellido.
    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: "Faltan campos obligatorios: nombre, apellido, email, password, rol." });
    }

    if (role !== 'THERAPIST' && role !== 'PATIENT') {
        return res.status(400).json({ message: "Rol no válido. Debe ser 'THERAPIST' o 'PATIENT'." });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
    }

    try {
        // 1. Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Este email ya está registrado." });
        }

        // 2. LÓGICA DE CÓDIGO DE INVITACIÓN (Solo Validación)
        if (role === 'THERAPIST') {
            if (!invitationCode) {
                return res.status(400).json({ message: "El código de invitación es obligatorio para el registro de terapeutas." });
            }

            const CORRECT_INVITE_CODE = process.env.THERAPIST_INVITE_CODE;
            
            if (!CORRECT_INVITE_CODE) {
                 console.error("ERROR CRÍTICO: La variable THERAPIST_INVITE_CODE no está definida en Render.");
                 return res.status(500).json({ message: "Error interno del servidor. Falta el código de invitación maestro." });
            }

            if (invitationCode !== CORRECT_INVITE_CODE) {
                return res.status(403).json({ message: "Código de invitación no válido." });
            }
        } 
        
        // 3. Hash de la Contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Crear Usuario en la Base de Datos
        // 🚨 CAMBIO CRÍTICO: Concatenar firstName y lastName en el campo 'firstName'
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const newUser = await prisma.user.create({
            data: {
                // Solo se usa el campo 'firstName' para almacenar el nombre completo
                firstName: fullName,
                email,
                password: hashedPassword,
                role,
                // 'invitationCode' y 'lastName' se excluyen para cumplir con el modelo de DB
            }
        });

        // 5. Generar JWT
        const token = signToken(newUser.id);

        // 6. Enviar Respuesta Exitosa
        res.status(201).json({
            status: 'success',
            token,
            userId: newUser.id,
            firstName: newUser.firstName,
            role: newUser.role,
        });

    } catch (error) {
        if (error.code === 'P2002') {
             return res.status(409).json({ 
                 message: `El email ya está registrado.` 
             });
        }
        
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error interno del servidor durante el registro." });
    }
};

// =========================================================================
// 2. INICIO DE SESIÓN (POST /api/auth/login)
// =========================================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Proporcione email y contraseña." });
    }

    try {
        // 1. Buscar usuario
        const user = await prisma.user.findUnique({ where: { email } });

        // 2. Verificar si el usuario existe y si la contraseña es correcta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciales incorrectas (email o contraseña)." });
        }

        // 3. Generar JWT
        const token = signToken(user.id);

        // 4. Enviar Respuesta Exitosa (Ajustada para que el frontend lo use fácilmente)
        res.status(200).json({
            status: 'success',
            token,
            userId: user.id,
            firstName: user.firstName,
            role: user.role,
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor durante el inicio de sesión." });
    }
};