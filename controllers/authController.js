// controllers/authController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inicializar Prisma
const prisma = new PrismaClient();

// =========================================================================
// FUNCIÓN AUXILIAR: GENERAR JWT
// =========================================================================

const signToken = (id, role) => { 
    // Usar un valor de emergencia si JWT_SECRET no está definido en Render.
    const secret = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    
    // Incluir el rol en el payload del JWT
    return jwt.sign({ id, role }, secret, { 
        expiresIn: expiresIn
    });
};

// =========================================================================
// 1. REGISTRO DE USUARIO (POST /api/auth/register)
// =========================================================================

exports.register = async (req, res) => {
    const { firstName, lastName, email, password, role, invitationCode } = req.body;

    // Validación básica de campos requeridos
    if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ message: "Faltan campos obligatorios: nombre, apellido, email, password, rol." });
    }

    // Validación de rol
    if (role !== 'THERAPIST' && role !== 'PATIENT') {
        return res.status(400).json({ message: "Rol inválido. Debe ser PATIENT o THERAPIST." });
    }

    try {
        // 1. Verificar si el usuario ya existe (captura el 409)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Un usuario con ese correo ya existe." });
        }

        // 2. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 12); 

        // 3. Crear usuario
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword, 
                role,
                isVerified: role === 'THERAPIST' ? false : true, // Los terapeutas pueden requerir verificación manual
            }
        });
        
        // 4. Generar JWT
        const token = signToken(user.id, user.role); 

        // 5. Enviar Respuesta Exitosa (201 Created)
        res.status(201).json({
            status: 'success',
            token,
            userId: user.id,
            firstName: user.firstName,
            role: user.role,
            message: 'Registro exitoso.'
        });

    } catch (error) {
        // 🛑 ARREGLO CRÍTICO: Manejo de errores para evitar 500s.
        console.error("Error detallado en el registro:", error); 
        
        // Captura errores de unicidad de Prisma (aunque ya lo verificamos, es un respaldo)
        if (error.code === 'P2002') { 
            return res.status(409).json({ message: "El correo electrónico ya está en uso." });
        }
        
        // Error genérico del servidor
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

        // 4. Enviar Respuesta Exitosa (200 OK)
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


// =========================================================================
// MIDDLEWARE DE PROTECCIÓN DE RUTAS (Para uso externo en routes/*.js)
// =========================================================================

exports.protect = async (req, res, next) => {
    // 1. Obtener el token y verificar si existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            message: 'Acceso denegado. No ha iniciado sesión.' 
        });
    }

    try {
        // 2. Verificar el token
        const secret = process.env.JWT_SECRET || 'SECRETO_TEMPORAL_DEV_2025';
        const decoded = jwt.verify(token, secret);

        // 3. Buscar el usuario del token
        const freshUser = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!freshUser) {
            return res.status(401).json({ 
                message: 'El usuario del token ya no existe.' 
            });
        }
        
        // 4. Asignar el usuario al request
        req.user = freshUser;
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: 'Token inválido o expirado.' 
        });
    }
};

// Middleware para restringir el acceso a roles específicos
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user viene del middleware protect
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'No tiene permiso para realizar esta acción.' 
            });
        }
        next();
    };
};