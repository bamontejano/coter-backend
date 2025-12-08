// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// El cliente Prisma
const prisma = new PrismaClient();

// 🚨 CRÍTICO: Asegúrate de que esta variable de entorno esté definida:
// 1. En tu archivo .env local: THERAPIST_INVITE_CODE=TU_CODIGO_SECRETO
// 2. En la configuración de variables de entorno de Render.

// Función helper para generar el token JWT
const signToken = id => {
    // 🚨 CAMBIO CLAVE: Usar un valor de emergencia si la variable de entorno falta
    const secret = process.env.JWT_SECRET || 'ESTE_SECRETO_DEBE_SER_REEMPLAZADO_EN_PRODUCCION';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    
    return jwt.sign({ id }, secret, {
        expiresIn: expiresIn
    });

// =========================================================================
// 1. REGISTRO DE USUARIO (POST /api/auth/register)
// =========================================================================
exports.register = async (req, res) => {
    // 🚨 CAMBIO CLAVE: Incluir 'lastName' y separar 'invitationCode'
    const { firstName, lastName, email, password, role, invitationCode } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: "Faltan campos obligatorios: nombre, apellido, email, password, rol." });
    }

    if (role !== 'THERAPIST' && role !== 'PATIENT') {
        return res.status(400).json({ message: "Rol de usuario inválido." });
    }
    
    try {
        // ----------------------------------------------------
        // 1. VALIDACIÓN DEL CÓDIGO DE INVITACIÓN (SÓLO TERAPEUTA)
        // ----------------------------------------------------
        if (role === 'THERAPIST') {
            const requiredCode = process.env.THERAPIST_INVITE_CODE;
            
            if (!requiredCode) {
                 // Esto es un fallo de configuración interno, deberíamos usar 500
                 console.error("CRÍTICO: THERAPIST_INVITE_CODE no está configurado en las variables de entorno.");
                 return res.status(500).json({ message: "Error interno: El código de invitación no está configurado en el servidor." });
            }

            if (invitationCode !== requiredCode) {
                // ⚠️ Devolver 400 AQUÍ (Validación de Negocio)
                return res.status(400).json({ message: 'El código de invitación es obligatorio para el registro de terapeutas.' });
            }
        }
        
        // ----------------------------------------------------
        // 2. CREACIÓN DEL USUARIO (SÓLO CAMPOS DEL MODELO)
        // ----------------------------------------------------
        
        // 🚨 CRÍTICO: El campo 'invitationCode' ya NO está en el objeto 'data'
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName, // Asumiendo que existe en tu modelo.
                email,
                password: hashedPassword,
                role,
                // invitationCode YA NO SE INCLUYE AQUÍ
            }
        });

        // ----------------------------------------------------
        // 3. GENERACIÓN DE TOKEN Y RESPUESTA
        // ----------------------------------------------------
        const token = signToken(newUser.id);

        res.status(201).json({
            status: 'success',
            token,
            userId: newUser.id,
            firstName: newUser.firstName,
            role: newUser.role,
            message: 'Registro exitoso.'
        });

    } catch (error) {
        // Manejar errores de Prisma (ej: email duplicado)
        if (error.code === 'P2002') {
            return res.status(400).json({ message: `El email '${error.meta.target.join(', ')}' ya está registrado.` });
        }
        
        // El error 500 ocurre si hay un error no manejado
        console.error("Error en el registro:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor durante el registro.' 
        });
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
        // Asumiendo que bcrypt.compare funciona
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
        res.status(500).json({ 
            message: "Error interno del servidor durante el login." 
        });
    }
};