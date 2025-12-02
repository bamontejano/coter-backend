// controllers/therapistController.js

// ⚠️ Importación de Prisma: Asegúrate de que esta ruta a tu Prisma Client es correcta
const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------------------------
// 1. OBTENER PACIENTES ASIGNADOS (GET /api/therapist/patients)
// ----------------------------------------------------------------------

exports.getPatients = async (req, res) => {
    // 💡 CORREGIDO: Usar req.user.id (la clave más común en el payload del JWT)
    const therapistId = req.user.id;
    
    try {
        if (!therapistId) {
            return res.status(401).json({ message: "ID de terapeuta no disponible. Acceso no autorizado." });
        }

        // Consulta a la base de datos (Neon)
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
                // Añade aquí cualquier otro campo que el dashboard necesite
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
    // 💡 CORREGIDO
    const therapistId = req.user.id; // ID del terapeuta (viene del token)
    const { patientEmail } = req.body; // Email del paciente a asignar

    if (!patientEmail) {
        return res.status(400).json({ message: 'Se requiere el email del paciente.' });
    }

    try {
        // 1. Buscar al paciente por email
        const patient = await prisma.user.findUnique({
            where: { email: patientEmail }
        });

        if (!patient || patient.role !== 'PATIENT') {
            return res.status(404).json({ message: 'Paciente no encontrado o rol incorrecto.' });
        }

        // 2. Asignar el ID del terapeuta al paciente (Actualizar el registro)
        const updatedPatient = await prisma.user.update({
            where: { id: patient.id },
            data: { therapistId: therapistId }
        });

        res.status(200).json({ 
            message: `Paciente ${updatedPatient.firstName} asignado exitosamente.`,
            patient: { id: updatedPatient.id, email: updatedPatient.email }
        });

    } catch (error) {
        console.error("Error al asignar paciente:", error.message);
        res.status(500).json({ message: 'Error interno al intentar asignar paciente.' });
    }
};

// ----------------------------------------------------------------------
// 3. OBTENER PERFIL DE PACIENTE (GET /api/therapist/patient/:patientId)
// ----------------------------------------------------------------------

exports.getPatientProfile = async (req, res) => {
    // 💡 CORREGIDO
    const therapistId = req.user.id;
    const patientId = req.params.patientId;

    try {
        const patient = await prisma.user.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                therapistId: true, // Campo crucial para la verificación
                // Puedes añadir otros detalles sensibles aquí
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Paciente no encontrado.' });
        }

        // ⚠️ Verificación de Autorización: Solo el terapeuta asignado puede ver el perfil.
        if (patient.therapistId !== therapistId) {
            return res.status(403).json({ message: 'Acceso denegado: El paciente no está asignado a usted.' });
        }

        res.status(200).json(patient);
        
    } catch (error) {
        console.error("Error al obtener perfil del paciente:", error.message);
        res.status(500).json({ message: 'Error interno al obtener el perfil del paciente.' });
    }
};

// ----------------------------------------------------------------------
// 4. CREAR OBJETIVO (POST /api/therapist/goals)
// ----------------------------------------------------------------------

exports.createGoal = async (req, res) => {
    // 💡 CORREGIDO
    const therapistId = req.user.id;
    // patientId debe ser el ID de la base de datos (UUID)
    const { patientId, title, description, dueDate } = req.body; 

    if (!patientId || !title || !dueDate) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (patientId, title, dueDate).' });
    }

    try {
        // 1. Verificación de propiedad (Asegurar que el paciente está asignado a este terapeuta)
        const patient = await prisma.user.findUnique({
            where: { id: patientId, therapistId: therapistId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'No tiene permiso para crear objetivos para este paciente.' });
        }

        // 2. Crear el objetivo en la DB
        const newGoal = await prisma.goal.create({
            data: {
                patientId: patientId,
                therapistId: therapistId,
                title: title,
                description: description || null,
                dueDate: new Date(dueDate), // Convertir la fecha a objeto Date
                status: 'PENDING' // Estado inicial
            }
        });

        res.status(201).json({ 
            message: 'Objetivo creado exitosamente.',
            goal: newGoal
        });

    } catch (error) {
        console.error("Error al crear objetivo:", error.message);
        res.status(500).json({ message: 'Error interno al crear el objetivo.' });
    }
};

// ----------------------------------------------------------------------
// 5. OBTENER OBJETIVOS DEL PACIENTE (GET /api/therapist/goals/:patientId)
// ----------------------------------------------------------------------

exports.getPatientGoals = async (req, res) => {
    // 💡 CORREGIDO
    const therapistId = req.user.id;
    const patientId = req.params.patientId;

    try {
        // 1. Verificación de propiedad (Verificar que el paciente está asignado al terapeuta)
        const patient = await prisma.user.findUnique({
            where: { id: patientId, therapistId: therapistId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'No tiene permiso para ver los objetivos de este paciente.' });
        }

        // 2. Obtener todos los objetivos asociados a ese paciente
        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(goals);
        
    } catch (error) {
        console.error("Error al obtener objetivos:", error.message);
        res.status(500).json({ message: 'Error interno al obtener los objetivos.' });
    }
};