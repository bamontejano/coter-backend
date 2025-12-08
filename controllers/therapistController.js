// controllers/therapistController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// ... (El resto del código de assignPatient y getPatients permanece igual)

// =========================================================================
// 3. OBTENER PERFIL DEL PACIENTE (GET /api/therapist/patient/:patientId)
// =========================================================================
exports.getPatientProfile = async (req, res) => {
    const { patientId } = req.params; 
    const therapistId = req.user.id; 

    try {
        // A. Verificar la relación existente (Mantenemos esta verificación, es CRÍTICA)
        const relationship = await prisma.patientTherapist.findFirst({
            where: {
                patientId: patientId,
                therapistId: therapistId,
            }
        });

        if (!relationship) {
            return res.status(403).json({ message: "Acceso denegado. El paciente no está asignado a este terapeuta." });
        }

        // B. Obtener el perfil base del paciente (SIN INCLUSIONES)
        const patientProfile = await prisma.user.findUnique({
            where: { id: patientId },
        });

        if (!patientProfile) {
            return res.status(404).json({ message: "Perfil del paciente no encontrado." });
        }
        
        // C. OBTENER DATOS RELACIONADOS POR SEPARADO (Nueva lógica para evitar error 500)
        // 🚨 CAMBIO 1: Obtener checkins directamente del modelo Checkin
        const checkins = await prisma.checkin.findMany({
            where: { patientId: patientId },
            orderBy: { date: 'desc' }, 
            take: 10 
        });

        // 🚨 CAMBIO 2: Obtener metas directamente del modelo Goal
        const goals = await prisma.goal.findMany({ 
            where: {
                patientId: patientId,
                therapistId: therapistId // Filtro por el terapeuta actual
            },
            orderBy: { dueDate: 'asc' }
        });
        
        // D. Limpiar el perfil antes de enviar y combinarlos
        const { password, ...safeProfile } = patientProfile;
        
        // 🚨 CAMBIO 3: Devolver el perfil base CON los datos relacionados adjuntos
        res.status(200).json({ 
            status: 'success', 
            data: { 
                patient: { 
                    ...safeProfile,
                    checkins,
                    goals
                } 
            } 
        });

    } catch (error) {
        console.error("Error al obtener perfil del paciente:", error);
        // Si el error es un 'findMany' indefinido, significa que los modelos Checkin o Goal no existen.
        if (error instanceof TypeError && error.message.includes('findMany')) {
            console.error("ERROR CRÍTICO: El modelo Checkin o Goal no existe en tu cliente Prisma. ¿Corriste 'npx prisma generate'?");
            return res.status(500).json({ message: "Error interno: Faltan modelos de datos (Checkin/Goal) en la base de datos." });
        }
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ... (El resto de las funciones de createGoal, getPatientGoals y updateGoal permanecen iguales)