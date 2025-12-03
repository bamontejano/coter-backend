// controllers/patientController.js

const prisma = require('../utils/prismaClient'); 
// Función de utilidad para obtener el ID del usuario del token
const getUserId = (req) => req.user.id || req.user.userId;

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    const patientId = getUserId(req);
    const { moodScore, notes } = req.body; 

    // El moodScore es obligatorio para registrar un check-in
    if (!moodScore) {
        return res.status(400).json({ message: 'El puntaje de ánimo (moodScore) es obligatorio para el check-in.' });
    }

    // Validación básica del score (asumiendo que es de 1 a 5)
    if (moodScore < 1 || moodScore > 5) {
        return res.status(400).json({ message: 'El puntaje de ánimo debe estar entre 1 y 5.' });
    }

    try {
        const newCheckin = await prisma.checkin.create({
            data: {
                patientId: patientId,
                moodScore: parseInt(moodScore), // Aseguramos que sea Integer
                notes: notes || null,
                // date y timestamps por defecto usan now()
            }
        });

        res.status(201).json({ 
            message: 'Check-in registrado exitosamente.',
            checkin: newCheckin
        });

    } catch (error) {
        console.error("Error al crear check-in:", error.message);
        res.status(500).json({ 
            message: 'Error interno al registrar el check-in.',
            details: error.message
        });
    }
};

// ----------------------------------------------------------------------
// 2. OBTENER METAS ASIGNADAS (GET /api/patient/goals)
// ----------------------------------------------------------------------

exports.getAssignedGoals = async (req, res) => {
    const patientId = getUserId(req);

    try {
        // Obtenemos todas las metas donde este usuario es el paciente
        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
            // Mantenemos la lógica de ordenación que ya probamos
            orderBy: [
                { dueDate: 'asc' }, 
                { createdAt: 'desc' }
            ]
        });

        res.status(200).json(goals);
        
    } catch (error) {
        console.error("Error al obtener metas del paciente:", error.message);
        res.status(500).json({ 
            message: 'Error interno al obtener las metas asignadas.',
            details: error.message
        });
    }
};