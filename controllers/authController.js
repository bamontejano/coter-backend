// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Nota: Si usas dotenv, asegúrate de que esté configurado en server.js
// El cliente Prisma
const prisma = new PrismaClient();

// 🚨 CRÍTICO: Asegúrate de que esta variable de entorno esté definida:
// 1. En tu archivo .env local: THERAPIST_INVITE_CODE=TU_CODIGO_SECRETO
// 2. En la configuración de variables de entorno de Render.

// Función helper para generar el token JWT
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// =========================================================================
// 1. REGISTRO DE USUARIO (POST /api/auth/register)
// =========================================================================
exports.register = async (req, res) => {
    const { firstName, email, password, role, invitationCode } = req.body;

    if (!firstName || !email || !password || !role) {
        return res.status(400).json({ message: "Faltan campos obligatorios: nombre, email, password, rol." });
    }

    if (role !== 'THERAPIST' && role !== 'PATIENT') {
        return res.status(400).json({ message: "Rol no válido. Debe ser 'THERAPIST' o 'PATIENT'." });
    }
    
    // Validaciones básicas de seguridad
    if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
    }

    try {
        // 1. Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Este email ya está registrado." });
        }

        // 2. 🚨 LÓGICA DE CÓDIGO DE INVITACIÓN (Restaurada)
        let finalInvitationCode = null;

        if (role === 'THERAPIST') {
            if (!invitationCode) {
                return res.status(400).json({ message: "El código de invitación es obligatorio para el registro de terapeutas." });
            }

            const CORRECT_INVITE_CODE = process.env.THERAPIST_INVITE_CODE;
            
            if (!CORRECT_INVITE_CODE) {
                 // Esto es un error de configuración del servidor, no del usuario.
                 console.error("ERROR CRÍTICO: La variable THERAPIST_INVITE_CODE no está definida en .env");
                 return res.status(500).json({ message: "Error interno del servidor. Falta el código de invitación maestro." });
            }

            if (invitationCode !== CORRECT_INVITE_CODE) {
                return res.status(403).json({ message: "Código de invitación no válido." });
            }
            
            // Si el código es correcto, lo guardamos para el nuevo usuario.
            finalInvitationCode = invitationCode;

        } 
        // Nota: Para PATIENT, no necesitamos código, por lo que finalInvitationCode será 'null'.

        // 3. Hash de la Contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Crear Usuario en la Base de Datos
        const newUser = await prisma.user.create({
            data: {
                firstName,
                email,
                password: hashedPassword,
                role,
                // Guardamos el código solo si es un terapeuta (o null si es paciente)
                invitationCode: finalInvitationCode, 
            }
        });

        // 5. Generar JWT
        const token = signToken(newUser.id);

        // 6. Enviar Respuesta Exitosa
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: newUser.id,
                    firstName: newUser.firstName,
                    email: newUser.email,
                    role: newUser.role,
                    // No enviamos el código o el hash de vuelta
                }
            }
        });

    } catch (error) {
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

        // 4. Enviar Respuesta Exitosa
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    email: user.email,
                    role: user.role,
                }
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor durante el inicio de sesión." });
    }
};