// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Función para firmar el Token Web JSON (JWT)
const signToken = (id, role) => { 
    // Usar un valor de emergencia si JWT_SECRET no está definido en Render.
    const secret = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    
    // CAMBIO CLAVE: Incluir el rol en el payload del JWT
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
        return res.status(400).json({ message: "El rol debe ser 'THERAPIST' o 'PATIENT'." });
    }
    
    try {
        // 1. Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Este email ya está registrado." });
        }

        // 2. Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12); 

        // 3. Crear el nuevo usuario
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            },
        });

        // 4. Generar JWT
        const token = signToken(newUser.id, newUser.role);

        // 5. Enviar Respuesta Exitosa (Usando la estructura anidada)
        res.status(201).json({
            status: 'success',
            token,
            message: "Registro exitoso.",
            data: {
                user: {
                    id: newUser.id,
                    firstName: newUser.firstName,
                    email: newUser.email,
                    role: newUser.role,
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
        const token = signToken(user.id, user.role); 

        // 4. Enviar Respuesta Exitosa (🚨 CORRECCIÓN: Estructura anidada para el frontend)
        res.status(200).json({
            status: 'success',
            token,
            data: { // <- ¡Aquí está la corrección!
                user: { // <- Estructura esperada por index.html
                    id: user.id,
                    firstName: user.firstName,
                    role: user.role,
                }
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor durante el login." });
    }
};