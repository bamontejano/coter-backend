// controllers/therapistController.js

const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------------------------
// 1. OBTENER PACIENTES ASIGNADOS (GET /api/therapist/patients)
// ----------------------------------------------------------------------

exports.getPatients = async (req, res) => {
    // 💡 CORRECCIÓN DEFENSIVA: Intentamos 'id' (el más común) y si no, usamos 'userId'.
    const therapistId = req.user.id || req.user.userId;
    
    try {
        if (!therapistId) {
            // Este es el mensaje que vemos cuando falla la extracción del ID
            return res.status(401).json({ message: "ID de terapeuta no disponible. Acceso no autorizado." });
        }
        
        // ... (El resto de la consulta DB es el mismo) ...
        const patients = await prisma.user.findMany({
            where: {
                therapistId: therapistId,
                role: 'PATIENT' 
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            }
        });

        res.status(200).json(patients);
        
    } catch (error) {
        console.error("Error al obtener pacientes (Consulta DB):", error.message);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener la lista de pacientes.',
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
// 2. ASIGNAR PACIENTE (PATCH /api/therapist/assign)
// ----------------------------------------------------------------------

exports.assignPatient = async (req, res) => {
    // 💡 CORRECCIÓN DEFENSIVA
    const therapistId = req.user.id || req.user.userId; 
    const { patientEmail } = req.body; 

    if (!patientEmail) {
        return res.status(400).json({ message: 'Se requiere el email del paciente.' });
    }
    // ... (restante lógica) ...
};

// ----------------------------------------------------------------------
// 3. OBTENER PERFIL DE PACIENTE (GET /api/therapist/patient/:patientId)
// ----------------------------------------------------------------------

exports.getPatientProfile = async (req, res) => {
    // 💡 CORRECCIÓN DEFENSIVA
    const therapistId = req.user.id || req.user.userId;
    const patientId = req.params.patientId;

    // ... (restante lógica) ...
};

// ----------------------------------------------------------------------
// 4. CREAR OBJETIVO (POST /api/therapist/goals)
// ----------------------------------------------------------------------

exports.createGoal = async (req, res) => {
    // 💡 CORRECCIÓN DEFENSIVA
    const therapistId = req.user.id || req.user.userId;
    const { patientId, title, description, dueDate } = req.body; 

    // ... (restante lógica) ...
};

// ----------------------------------------------------------------------
// 5. OBTENER OBJETIVOS DEL PACIENTE (GET /api/therapist/goals/:patientId)
// ----------------------------------------------------------------------

exports.getPatientGoals = async (req, res) => {
    // 💡 CORRECCIÓN DEFENSIVA
    const therapistId = req.user.id || req.user.userId;
    const patientId = req.params.patientId;

    // ... (restante lógica) ...
};