// controllers/therapistController.js

// ⚠️ IMPORTACIÓN CRÍTICA: Asegúrate de que esta ruta a tu Prisma Client es correcta
const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------------------------
// Función getPatients (Carga de la lista de pacientes del terapeuta)
// ----------------------------------------------------------------------
exports.getPatients = async (req, res) => {
    // req.user.id es el ID del terapeuta que se logueó
    const therapistId = req.user.id;
    
    try {
        // 1. Verificación de seguridad
        if (!therapistId) {
            // Este caso es muy raro si el authMiddleware funciona
            return res.status(401).json({ message: "ID de terapeuta no disponible. Acceso no autorizado." });
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
                // Puedes añadir más campos aquí si son necesarios en la interfaz
            }
        });

        // 3. Respuesta exitosa: Devuelve la lista real (vacía o llena)
        return res.status(200).json(patients);
        
    } catch (error) {
        // 4. Manejo de errores (Crucial para evitar el error 'JSON.parse')
        console.error("Error al obtener pacientes (Consulta DB):", error.message);
        
        // Siempre respondemos con JSON en caso de error para que el frontend no falle.
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener la lista de pacientes.',
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
// Funciones Placeholder para otras rutas (necesitas implementar la lógica real)
// ----------------------------------------------------------------------

exports.assignPatient = (req, res) => {
    return res.status(501).json({ message: 'Ruta de asignación no implementada.' });
};

// Aquí añadirías la lógica para exports.getPatientProfile, exports.createGoal, etc.

// ...