// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// 🚨 CORRECCIÓN 1: La función debe recibir el ID y el ROL
const signToken = (id, role) => { 
    // Usar un valor de emergencia si JWT_SECRET no está definido en Render.
    const secret = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    
    // 🚨 CAMBIO CLAVE: Incluir el rol en el payload del JWT
    return jwt.sign({ id, role }, secret, { 
        expiresIn: expiresIn
    });
};

// =========================================================================
// 1. REGISTRO DE USUARIO (POST /api/auth/register)
// =========================================================================
exports.register = async (req, res) => {
    const { firstName, lastName, email, password, role, invitationCode } = req.body;

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
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Este email ya está registrado." });
        }

        // LÓGICA DE CÓDIGO DE INVITACIÓN (Solo Validación)
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
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Concatenar nombre y apellido
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const newUser = await prisma.user.create({
            data: {
                firstName: fullName,
                email,
                password: hashedPassword,
                role,
            }
        });

        // 🚨 CORRECCIÓN 2: Pasar el ROL a signToken
        const token = signToken(newUser.id, newUser.role); 

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
        // 🚨 CORRECCIÓN 3: Pasar el ROL a signToken
        const token = signToken(user.id, user.role); 

        // 4. Enviar Respuesta Exitosa
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