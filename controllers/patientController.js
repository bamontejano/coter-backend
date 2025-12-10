// controllers/patientController.js (CORREGIDO DEFINITIVO)

// Asumo que tienes una forma de importar Prisma, por ejemplo:
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    // 🚨 CRÍTICO: Comprobación de seguridad directa.
    // Si 'protect' falló, req.user no existe.
    if (!req.user || !req.user.id) {
        // Si llegamos aquí, el middleware 'protect' no funcionó correctamente. 
        // Devolvemos 401/403 para no causar un 500.
        return res.status(401).json({ message: "Error de autenticación. Por favor, vuelva a iniciar sesión." });
    }

    const patientId = req.user.id; // Uso directo y seguro
    const { moodScore, notes } = req.body; 

    // Validación de datos
    if (!moodScore) {
        return res.status(400).json({ message: 'El puntaje de ánimo (moodScore) es obligatorio para el check-in.' });
    }
    if (moodScore < 1 || moodScore > 10) {
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
        // Este catch maneja errores de la DB (Prisma)
        console.error("Error al crear check-in (Prisma/DB):", error.message);
        res.status(500).json({ 
            message: 'Error interno al registrar el check-in. Verifique su base de datos.',
            details: error.message
        });
    }
};

// ----------------------------------------------------------------------
// 2. OBTENER METAS ASIGNADAS (GET /api/patient/goals)
// ----------------------------------------------------------------------

exports.getAssignedGoals = async (req, res) => {
    // 🚨 Comprobación de seguridad
    if (!req.user || !req.user.id) {
         return res.status(401).json({ message: "Error de autenticación." });
    }
    const patientId = req.user.id;

    try {
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
// ----------------------------------------------------------------------
// Otras funciones del patientController (si existen)...
// ----------------------------------------------------------------------