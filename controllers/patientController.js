// controllers/patientController.js (CORREGIDO)

const prisma = require('../utils/prismaClient'); 

// 🚨 CORRECCIÓN CRÍTICA: La función getUserId debe verificar la existencia de req.user
const getUserId = (req) => {
    // Si req.user no existe, el middleware protect falló o no se ejecutó.
    if (!req.user) {
        console.error("Error: req.user no definido en getUserId.");
        return null; 
    }
    // Si existe, devuelve el ID del usuario.
    return req.user.id || req.user.userId;
};

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    const patientId = getUserId(req); // Obtención segura del ID
    const { moodScore, notes } = req.body; 

    // CRÍTICO: Si el ID es nulo, devolvemos un error 401 que el frontend pueda interpretar
    if (!patientId) {
         return res.status(401).json({ message: "No se pudo identificar al paciente. Por favor, vuelva a iniciar sesión." });
    }

    // El moodScore es obligatorio para registrar un check-in
    if (!moodScore) {
        return res.status(400).json({ message: 'El puntaje de ánimo (moodScore) es obligatorio para el check-in.' });
    }

    // Validación del rango de 1 a 10
    if (moodScore < 1 || moodScore > 10) {
        return res.status(400).json({ message: 'El puntaje de ánimo debe estar entre 1 y 10.' });
    }

    try {
        const newCheckin = await prisma.checkin.create({
            data: {
                patientId: patientId,
                moodScore: parseInt(moodScore), // Aseguramos que sea Integer
                notes: notes || null,
            }
        });

        res.status(201).json({ 
            message: 'Check-in registrado exitosamente.',
            checkin: newCheckin
        });

    } catch (error) {
        // Este catch maneja errores de la DB (Prisma), no errores de autenticación/middleware.
        console.error("Error al crear check-in (Prisma/DB):", error.message);
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

    if (!patientId) {
         return res.status(401).json({ message: "No se pudo identificar al paciente." });
    }

    try {
        // Obtenemos todas las metas donde este usuario es el paciente
        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
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