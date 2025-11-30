// controllers/therapistController.js

const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------------------------
// Función getPatients (LÓGICA FINAL)
// ----------------------------------------------------------------------
exports.getPatients = async (req, res) => {
    // Asumimos que req.user.id fue puesto por el authMiddleware
    const therapistId = req.user.id; 
    
    try {
        // Buscar pacientes donde el campo 'therapistId' coincida con el ID del terapeuta logueado.
        const patients = await prisma.user.findMany({
            where: {
                therapistId: therapistId,
                role: 'PATIENT' // Opcional, para asegurar que solo trae pacientes
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                // Agrega otros campos necesarios para la interfaz del paciente
            }
        });

        return res.status(200).json(patients); 
        
    } catch (error) {
        console.error("Error al obtener pacientes:", error);
        return res.status(500).json({ message: 'Error interno al obtener la lista de pacientes.' });
    }
};

// Función mock para asignar paciente (puedes restaurar la lógica real aquí)
exports.assignPatient = (req, res) => {
    return res.status(501).json({ message: 'Ruta de asignación no implementada.' });
};