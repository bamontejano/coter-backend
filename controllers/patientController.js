// controllers/patientController.js (VERSIÓN FINAL Y BLINDADA)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    // Blindaje contra fallos de middleware: Si no hay usuario, es un fallo de autenticación.
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación. Vuelva a iniciar sesión." });
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
                // 🚨 CORRECCIÓN CRÍTICA 1: Cambiar 'moodScore' a 'mood'
                // 🚨 CORRECCIÓN CRÍTICA 2: Convertir el valor a String para evitar error de tipo
                mood: String(moodScore), 
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

// 🚨 NOTA: Se asume que esta función es necesaria para el gráfico del frontend
exports.getHistoricalCheckins = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación." });
    }
    const patientId = req.user.id;

    try {
        const checkins = await prisma.checkin.findMany({
            where: { patientId: patientId },
            orderBy: { createdAt: 'desc' },
            select: { 
                // 🚨 CRÍTICO: Usar el campo 'mood' del esquema
                mood: true, 
                createdAt: true 
            },
            take: 30,
        });
        // Mapeamos los resultados para que el frontend espere 'moodScore' (si el frontend no se puede cambiar)
        const formattedCheckins = checkins.map(c => ({
            moodScore: parseInt(c.mood), // Convertimos la cadena a número para el gráfico
            createdAt: c.createdAt
        }));
        
        res.status(200).json(formattedCheckins);

    } catch (error) {
        console.error("Error al obtener check-ins históricos:", error.message);
        res.status(500).json({ message: 'Error interno al obtener el historial de check-ins.' });
    }
};