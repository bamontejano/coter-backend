// controllers/patientController.js

const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); // Inicialización correcta del cliente de Prisma

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

    // Validación básica del score (AHORA DE 1 A 10)
    if (moodScore < 1 || moodScore > 10) { // 🚨 CAMBIO AQUÍ
        return res.status(400).json({ message: 'El puntaje de ánimo debe estar entre 1 y 10.' }); // 🚨 Y AQUÍ
    }

    try {
        const newCheckin = await prisma.checkin.create({
            data: {
                patientId: patientId,
                // 🚨 CORRECCIÓN FINAL: Convertimos el número a String para cumplir con el schema.prisma
                mood: String(numericMoodScore), 
                notes: notes || null,
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
            // Mantenemos la lógica de ordenación
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