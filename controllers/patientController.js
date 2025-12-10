// controllers/patientController.js (VERSIÓN BLINDADA Y FINAL)

// Importación necesaria para el funcionamiento de Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    // 🚨 Blindaje contra fallos de middleware: Si no hay usuario, es un fallo de autenticación.
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación. Vuelva a iniciar sesión." });
    }

    const patientId = req.user.id; // Uso directo y seguro
    const { moodScore, notes } = req.body; 

    // Validación
    if (!moodScore || moodScore < 1 || moodScore > 10) {
        return res.status(400).json({ message: 'El puntaje de ánimo debe ser un número entre 1 y 10.' });
    }

    try {
        const newCheckin = await prisma.checkin.create({
            data: {
                // Aquí usamos el ID obtenido de forma segura
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
        // 🚨 Manejo de error específico de Prisma/BD
        console.error("Error al crear check-in (Prisma/DB):", error);

        // Si es un error de BD, devolvemos un 500 con el mensaje detallado (si está disponible)
        let errorMessage = 'Error interno al registrar el check-in. Verifique su base de datos.';
        if (error.code && error.meta) {
            errorMessage += ` Código Prisma: ${error.code}. Detalle: ${JSON.stringify(error.meta)}`;
        } else if (error.message) {
             // A veces el detalle es solo el mensaje de error general
            errorMessage += ` Detalle: ${error.message}`;
        }

        res.status(500).json({ 
            message: errorMessage
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
            orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }]
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
            take: 30,
        });
        res.status(200).json(checkins);

    } catch (error) {
        console.error("Error al obtener check-ins históricos:", error.message);
        res.status(500).json({ message: 'Error interno al obtener el historial de check-ins.' });
    }
};