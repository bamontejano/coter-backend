// controllers/authController.js

const prisma = require('../utils/prismaClient'); // Asegúrate de que esta ruta es correcta
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ----------------------------------------------------------------------
// Función de LOGIN (LÓGICA FINAL - SIN MODO PRUEBA)
// ----------------------------------------------------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Error si el email no existe en la base de datos
            return res.status(401).json({ message: 'Credenciales inválidas: Usuario no encontrado.' });
        }

        // 2. Comparar contraseñas: compara el password plano con el hash de la DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Error si la contraseña no coincide con el hash
            return res.status(401).json({ message: 'Credenciales inválidas: Contraseña incorrecta.' });
        }

        // 3. Generar token JWT (Solo si isMatch es TRUE)
        // El token contiene el ID y el rol para que el middleware pueda verificar las rutas
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // El token expira en 1 día
        );

        // 4. Respuesta exitosa
        res.status(200).json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
            } 
        });

    } catch (error) {
        console.error("Error interno del servidor en login:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

exports.register = (req, res) => {
    // Si esta ruta no está implementada, devuelve 501
    res.status(501).json({ message: 'Ruta de registro no implementada.' });
};