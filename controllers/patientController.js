// controllers/patientController.js (FINAL Y ESTABLE)

// 🚨 CORRECCIÓN CRÍTICA: Usar la importación estándar y segura de Prisma.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// 🚨 Función getUserId ELIMINADA: Causaba inestabilidad al inicio del servidor.

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    // 🚨 Blindaje de seguridad: Se comprueba que req.user exista
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación. Por favor, vuelva a iniciar sesión." });
    }
    
    // Uso directo y seguro del ID
    const patientId = req.user.id; 
    const { moodScore, notes } = req.body; 

    // El moodScore es obligatorio para registrar un check-in
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
                moodScore: parseInt(moodScore), // Aseguramos que sea Integer
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
    // 🚨 Blindaje de seguridad
    if (!req.user || !req.user.id) {
         return res.status(401).json({ message: "Error de autenticación. Por favor, vuelva a iniciar sesión." });
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