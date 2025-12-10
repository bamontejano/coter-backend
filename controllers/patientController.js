// controllers/patientController.js (FINALIZADO)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Inicialización de Prisma estándar

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    // 🚨 Seguridad: Comprobar que el usuario esté adjunto (establecido por el middleware 'protect')
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación. Por favor, vuelva a iniciar sesión." });
    }

    const patientId = req.user.id; 
    const { moodScore, notes } = req.body; 

    // Validación
    if (!moodScore || moodScore < 1 || moodScore > 10) {
        return res.status(400).json({ message: 'El puntaje de ánimo debe ser un número entre 1 y 10.' });
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
        console.error("Error al crear check-in (Prisma/DB):", error);
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
        res.status(500).json({ message: 'Error interno al obtener las metas asignadas.' });
    }
};

// ----------------------------------------------------------------------
// 3. OBTENER CHECK-INS HISTÓRICOS (GET /api/patient/checkins)
// ----------------------------------------------------------------------

exports.getHistoricalCheckins = async (req, res) => { 
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación." });
    }
    const patientId = req.user.id;

    try {
        const checkins = await prisma.checkin.findMany({
            where: { patientId: patientId },
            orderBy: { createdAt: 'desc' },
            select: { moodScore: true, createdAt: true },
            take: 30, // Limitar para el gráfico
        });
        res.status(200).json(checkins);

    } catch (error) {
        console.error("Error al obtener check-ins históricos:", error.message);
        res.status(500).json({ message: 'Error interno al obtener el historial de check-ins.' });
    }
};