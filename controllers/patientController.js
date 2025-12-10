// controllers/patientController.js (VERSION BLINDADA Y FINAL)

// 🚨 CORRECCIÓN CRÍTICA: Importación directa y estándar de Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// 🚨 Función getUserId ELIMINADA. Los controladores ahora usan req.user.id
// para mayor estabilidad.

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación. Vuelva a iniciar sesión." });
    }
    const patientId = req.user.id; 
    const { moodScore, notes } = req.body; 

    if (!moodScore || moodScore < 1 || moodScore > 10) {
        return res.status(400).json({ message: 'El puntaje de ánimo debe estar entre 1 y 10.' });
    }

    try {
        const newCheckin = await prisma.checkin.create({
            data: {
                patientId: patientId,
                moodScore: parseInt(moodScore),
                notes: notes || null,
            }
        });

        res.status(201).json({ 
            message: 'Check-in registrado exitosamente.',
            checkin: newCheckin
        });

    } catch (error) {
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
    // 🚨 ESTA ES LA FUNCIÓN QUE SE ESTABA PERDIENDO.
    if (!req.user || !req.user.id) {
         return res.status(401).json({ message: "Error de autenticación. Vuelva a iniciar sesión." });
    }
    const patientId = req.user.id;

    try {
        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
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