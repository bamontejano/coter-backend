// controllers/patientController.js
const prisma = require('../utils/prismaClient'); 

// Controlador defensivo: usa req.user.id o req.user.userId
const getUserId = (req) => req.user.id || req.user.userId;

// ----------------------------------------------------------------------
// 1. OBTENER PERFIL DEL PACIENTE (GET /api/patient/profile)
// ----------------------------------------------------------------------

exports.getProfile = async (req, res) => {
    const patientId = getUserId(req);

    try {
        const profile = await prisma.user.findUnique({
            where: { id: patientId, role: 'PATIENT' },
            // Selecciona solo la información que el paciente debe ver
            select: {
                id: true,
                firstName: true,
                email: true,
                therapistId: true,
                createdAt: true,
                // Si el paciente tiene un terapeuta asignado, incluimos sus datos
                therapist: {
                    select: {
                        firstName: true,
                        email: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ message: 'Perfil de paciente no encontrado.' });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error("Error al obtener perfil del paciente:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// ----------------------------------------------------------------------
// 2. OBTENER METAS ASIGNADAS (GET /api/patient/goals)
// ----------------------------------------------------------------------
exports.getGoals = (req, res) => {
    // 💡 Lógica pendiente: Consultar metas por patientId.
    res.status(200).json({ message: 'Endpoint de metas del paciente. Lógica pendiente.' });
};

// ----------------------------------------------------------------------
// 3. ENVIAR CHECK-IN DIARIO (POST /api/patient/checkin)
// ----------------------------------------------------------------------
exports.submitCheckin = (req, res) => {
    // 💡 Lógica pendiente: Recibir datos de check-in (ej. mood, notas) y guardarlos.
    res.status(200).json({ message: 'Endpoint de check-in. Lógica pendiente.' });
};

// ----------------------------------------------------------------------
// 4. OBTENER TAREAS ASIGNADAS (GET /api/patient/assignments)
// ----------------------------------------------------------------------
exports.getAssignments = (req, res) => {
    // 💡 Lógica pendiente: Obtener tareas/lecturas asignadas por el terapeuta.
    res.status(200).json({ message: 'Endpoint de tareas. Lógica pendiente.' });
};