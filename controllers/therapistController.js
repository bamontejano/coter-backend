// controllers/therapistController.js

// ⚠️ IMPORTACIÓN CRÍTICA: Asegúrate de que esta ruta es correcta para tu Prisma Client
const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------------------------
// Función getPatients (Carga de la lista de pacientes del terapeuta)
// ----------------------------------------------------------------------
exports.getPatients = async (req, res) => {
    // req.user.id y req.user.role son añadidos por el authMiddleware
    const therapistId = req.user.id;
    
    try {
        // 1. Verificación de seguridad (aunque el middleware debería garantizar esto)
        if (!therapistId) {
            return res.status(401).json({ message: "ID de terapeuta no disponible. Revise el token." });
        }

        // 2. Consulta a la base de datos (Neon) con Prisma
        // Busca usuarios (pacientes) cuyo campo therapistId coincida con el ID del terapeuta logueado.
        const patients = await prisma.user.findMany({
            where: {
                // Filtra por el ID del terapeuta y asegura que el rol es PATIENT
                therapistId: therapistId,
                role: 'PATIENT' 
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                // Añade aquí cualquier otro campo que el dashboard necesite
            }
        });

        // 3. Respuesta exitosa: Devuelve JSON
        return res.status(200).json(patients);
        
    } catch (error) {
        // 4. Manejo de errores (Crucial para evitar el error 'JSON.parse')
        console.error("Error al obtener pacientes:", error.message);
        
        // El error puede ser de Prisma, de conexión a la DB, etc.
        // Siempre respondemos con JSON para que el frontend lo pueda manejar.
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener la lista de pacientes.',
            // Proporciona el mensaje de error de la DB para depuración en los logs de Render
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
// Funciones Mock (para evitar fallos si otras rutas están activas)
// ----------------------------------------------------------------------
exports.assignPatient = (req, res) => {
    return res.status(501).json({ message: 'Ruta de asignación no implementada.' });
};

// Puedes añadir más exports aquí para otras rutas de terapeuta...

// ...