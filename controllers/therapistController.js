// controllers/therapistController.js (VERSION BLINDADA CON getPatients)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// La función signToken se asume que existe en la versión completa del archivo.
// const signToken = (id, role) => { ... }; 

// =========================================================================
// 1. ASIGNAR PACIENTE (POST /api/therapist/assign)
// =========================================================================
exports.assignPatient = async (req, res) => {
    const { patientEmail } = req.body; 
    const therapistId = req.user.id; 

    if (!patientEmail) {
        return res.status(400).json({ message: "El email del paciente es obligatorio." });
    }

    try {
        // A. BUSCAR Y VALIDAR PACIENTE
        const patient = await prisma.user.findUnique({ where: { email: patientEmail } }); 

        if (!patient) {
            return res.status(404).json({ message: "Usuario no registrado." });
        }
        
        if (patient.role !== 'PATIENT') {
            return res.status(400).json({ message: "Solo se puede asignar a un paciente." });
        }
        
        if (patient.therapistId === therapistId) {
            return res.status(400).json({ message: "Este paciente ya está asignado a usted." });
        }

        // B. ASIGNAR PACIENTE
        const updatedPatient = await prisma.user.update({
            where: { id: patient.id },
            data: { therapistId: therapistId },
            select: { id: true, email: true, name: true, therapistId: true }
        });

        res.status(200).json({ 
            status: 'success', 
            message: `Paciente ${updatedPatient.name} asignado exitosamente.`,
            data: { patient: updatedPatient } 
        });

    } catch (error) {
        console.error("Error al asignar paciente:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 2. OBTENER PACIENTES ASIGNADOS (GET /api/therapist/patients)
// =========================================================================
// 🚨 ESTA ES LA FUNCIÓN QUE PROBABLEMENTE ESTABA FALLANDO
exports.getPatients = async (req, res) => {
    // req.user.id es seguro gracias al nuevo auth.js
    const therapistId = req.user.id; 
    
    try {
        const patients = await prisma.user.findMany({
            where: {
                therapistId: therapistId, // Filtrar por los pacientes de este terapeuta
                role: 'PATIENT'           // Asegurarse que solo sean pacientes
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                // Si necesitas más datos, añádelos aquí.
            },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({
            status: 'success',
            results: patients.length,
            data: { patients }
        });

    } catch (error) {
        console.error("Error al obtener pacientes asignados:", error.message);
        res.status(500).json({ message: "Error interno del servidor al cargar pacientes." });
    }
};

// ... Asegúrate de añadir aquí el resto de tus funciones: getPatientProfile, createGoal, getPatientGoals, updateGoal, etc. 
// Para el ejemplo, incluyo una de las que tenías:

// =========================================================================
// 5. OBTENER METAS DE UN PACIENTE (GET /api/therapist/goals/:patientId)
// =========================================================================
exports.getPatientGoals = async (req, res) => {
    const { patientId } = req.params;
    const therapistId = req.user.id; // Asumimos que esta comprobación es correcta

    try {
        const goals = await prisma.goal.findMany({
            where: { 
                patientId: patientId,
                therapistId: therapistId // Opcional: asegurar que solo ve sus pacientes
            },
            orderBy: [{ createdAt: 'desc' }]
        });

        res.status(200).json({ 
            status: 'success', 
            results: goals.length,
            data: { goals } 
        });

    } catch (error) {
        console.error("Error al obtener metas del paciente:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};