// controllers/therapistController.js

const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------------------------
// 1. OBTENER PACIENTES ASIGNADOS (GET /api/therapist/patients)
// ----------------------------------------------------------------------

exports.getPatients = async (req, res) => {
    // ⚠️ CRÍTICO CORREGIDO: Usar req.user.userId para coincidir con el payload JWT
    const therapistId = req.user.userId;
    
    try {
        if (!therapistId) { /* ... */ } // Mantenemos la verificación

        const patients = await prisma.user.findMany({
            where: {
                therapistId: therapistId,
                role: 'PATIENT' 
            },
            select: { /* ... */ }
        });

        res.status(200).json(patients);
        
    } catch (error) { /* ... */ }
};

// ----------------------------------------------------------------------
// 2. ASIGNAR PACIENTE (PATCH /api/therapist/assign)
// ----------------------------------------------------------------------

exports.assignPatient = async (req, res) => {
    // ⚠️ CRÍTICO CORREGIDO: Usar req.user.userId
    const therapistId = req.user.userId; 
    const { patientEmail } = req.body; 

    // ... (El resto de la lógica de asignación es correcta) ...

    try { /* ... */ } catch (error) { /* ... */ }
};

// ----------------------------------------------------------------------
// 3. OBTENER PERFIL DE PACIENTE (GET /api/therapist/patient/:patientId)
// ----------------------------------------------------------------------

exports.getPatientProfile = async (req, res) => {
    // ⚠️ CRÍTICO CORREGIDO: Usar req.user.userId
    const therapistId = req.user.userId;
    const patientId = req.params.patientId;

    // ... (El resto de la lógica de verificación y obtención es correcta) ...

    try { /* ... */ } catch (error) { /* ... */ }
};

// ----------------------------------------------------------------------
// 4. CREAR OBJETIVO (POST /api/therapist/goals)
// ----------------------------------------------------------------------

exports.createGoal = async (req, res) => {
    // ⚠️ CRÍTICO CORREGIDO: Usar req.user.userId
    const therapistId = req.user.userId;
    const { patientId, title, description, dueDate } = req.body; 

    // ... (El resto de la lógica de verificación y creación es correcta) ...

    try { /* ... */ } catch (error) { /* ... */ }
};

// ----------------------------------------------------------------------
// 5. OBTENER OBJETIVOS DEL PACIENTE (GET /api/therapist/goals/:patientId)
// ----------------------------------------------------------------------

exports.getPatientGoals = async (req, res) => {
    // ⚠️ CRÍTICO CORREGIDO: Usar req.user.userId
    const therapistId = req.user.userId;
    const patientId = req.params.patientId;

    // ... (El resto de la lógica de verificación y obtención es correcta) ...

    try { /* ... */ } catch (error) { /* ... */ }
};