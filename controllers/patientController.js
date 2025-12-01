// controllers/patientController.js

const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------
// 1. OBTENER PERFIL PROPIO (GET /api/patient/me)
// ----------------------------------------------------
exports.getPatientProfile = async (req, res) => {
    const userId = req.user.id; 

    try {
        const patient = await prisma.user.findUnique({
            where: { id: userId, role: 'PATIENT' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                therapistId: true, // ID del terapeuta asignado
                // ... más campos
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Perfil de paciente no encontrado.' });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error("Error al obtener perfil:", error.message);
        res.status(500).json({ message: 'Error interno al obtener el perfil.' });
    }
};


// ----------------------------------------------------
// 2. OBTENER OBJETIVOS ASIGNADOS (GET /api/patient/goals)
// ----------------------------------------------------
exports.getGoals = async (req, res) => {
    const patientId = req.user.id;

    try {
        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(goals);
    } catch (error) {
        console.error("Error al obtener objetivos:", error.message);
        res.status(500).json({ message: 'Error interno al obtener los objetivos.' });
    }
};

// ----------------------------------------------------
// 3. REGISTRAR CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------
exports.createCheckIn = async (req, res) => {
    const patientId = req.user.id;
    // Asumimos que envías datos como nivel de ansiedad, sueño, etc.
    const { anxietyLevel, sleepHours, notes } = req.body; 

    if (!anxietyLevel) {
        return res.status(400).json({ message: 'Se requiere el nivel de ansiedad para el check-in.' });
    }

    try {
        // Necesitarás un modelo 'CheckIn' en tu schema.prisma
        const newCheckIn = await prisma.checkIn.create({ 
            data: {
                patientId: patientId,
                anxietyLevel: anxietyLevel,
                sleepHours: sleepHours,
                notes: notes || null,
            }
        });

        res.status(201).json({ message: 'Check-In registrado exitosamente.', checkIn: newCheckIn });
    } catch (error) {
        console.error("Error al registrar check-in:", error.message);
        res.status(500).json({ message: 'Error interno al registrar el check-in.' });
    }
};

// ----------------------------------------------------
// 4. ACTUALIZAR ESTADO DE OBJETIVO (PATCH /api/patient/goals/:goalId)
// ----------------------------------------------------
exports.updateGoalStatus = async (req, res) => {
    const patientId = req.user.id;
    const goalId = req.params.goalId;
    // Estado debe ser uno de los permitidos por tu esquema (e.g., 'COMPLETED', 'IN_PROGRESS')
    const { status } = req.body; 

    if (!status) {
        return res.status(400).json({ message: 'Se requiere el nuevo estado del objetivo.' });
    }

    try {
        // 1. Verificar la propiedad y actualizar
        const updatedGoal = await prisma.goal.update({
            where: { 
                id: goalId, 
                patientId: patientId // ⚠️ Crucial: Solo el dueño puede actualizar
            },
            data: { status: status }
        });

        res.status(200).json({ message: `Estado del objetivo ${goalId} actualizado a ${status}.`, goal: updatedGoal });
    } catch (error) {
        // Maneja el error si el objetivo no existe o no pertenece al paciente
        console.error("Error al actualizar objetivo:", error.message);
        res.status(500).json({ message: 'Error interno o objetivo no encontrado/no pertenece al paciente.' });
    }
};