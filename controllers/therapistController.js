// controllers/therapistController.js

const prisma = require('../utils/prismaClient'); 
const { Role } = require('@prisma/client'); // Importamos el Enum Role de Prisma

// Función de utilidad para obtener el ID del usuario de forma defensiva
const getUserId = (req) => req.user.id || req.user.userId;

// ----------------------------------------------------------------------
// 1. OBTENER PACIENTES ASIGNADOS (GET /api/therapist/patients)
// ----------------------------------------------------------------------

exports.getPatients = async (req, res) => {
    const therapistId = getUserId(req);
    
    try {
        if (!therapistId) {
            return res.status(401).json({ message: "ID de terapeuta no disponible. Acceso no autorizado." });
        }

        const patients = await prisma.user.findMany({
            where: {
                therapistId: therapistId,
                role: Role.PATIENT // Usamos el Enum de Prisma
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
            message: 'Error interno al obtener la lista de pacientes.',
            error: error.message 
        });
    }
};

// ----------------------------------------------------------------------
// 2. ASIGNAR UN NUEVO PACIENTE (PATCH /api/therapist/assign)
// ----------------------------------------------------------------------

exports.assignPatient = async (req, res) => {
    const therapistId = getUserId(req);
    const { patientEmail } = req.body;

    if (!patientEmail) {
        return res.status(400).json({ message: 'El email del paciente es obligatorio.' });
    }

    try {
        // 1. Buscar al paciente por email y rol PATIENT
        const patient = await prisma.user.findFirst({
            where: { 
                email: patientEmail, 
                role: Role.PATIENT
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Paciente no encontrado con ese email.' });
        }

        // 2. Asignar el terapeuta al paciente
        const updatedPatient = await prisma.user.update({
            where: { id: patient.id },
            data: { therapistId: therapistId }
        });

        res.status(200).json({ 
            message: `Paciente ${updatedPatient.firstName || updatedPatient.email} asignado exitosamente.`,
            patient: updatedPatient
        });

    } catch (error) {
        console.error("Error al asignar paciente:", error.message);
        res.status(500).json({ 
            message: 'Error interno al asignar el paciente.',
            error: error.message 
        });
    }
};


// ----------------------------------------------------------------------
// 3. CREAR OBJETIVO (POST /api/therapist/goals) - Nuevo!
// ----------------------------------------------------------------------

exports.createGoal = async (req, res) => {
    const therapistId = getUserId(req);
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
                // CRÍTICO: Aseguramos que la fecha sea válida
                dueDate: new Date(dueDate), 
                status: 'PENDING' 
            }
        });

        res.status(201).json({ 
            message: 'Objetivo creado exitosamente.',
            goal: newGoal
        });

    } catch (error) {
        // Aquí es donde obtienes el 500. Mostramos el error interno para debug.
        console.error("Error al crear objetivo:", error.message);
        res.status(500).json({ 
            message: 'Error interno al crear el objetivo.',
            details: error.message
        });
    }
};

// ----------------------------------------------------------------------
// 4. OBTENER OBJETIVOS DEL PACIENTE (GET /api/therapist/goals/:patientId) - Nuevo!
// ----------------------------------------------------------------------

exports.getPatientGoals = async (req, res) => {
    const therapistId = getUserId(req);
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
            orderBy: { dueDate: 'asc', createdAt: 'desc' } 
        });

        res.status(200).json(goals);
        
    } catch (error) {
        // Aquí es donde obtienes el 500 al cargar.
        console.error("Error al obtener objetivos:", error.message);
        res.status(500).json({ 
            message: 'Error interno al obtener los objetivos.',
            details: error.message
        });
    }
};

// ----------------------------------------------------------------------
// 5. OBTENER PERFIL DE UN PACIENTE ESPECÍFICO (GET /api/therapist/patient/:patientId) - PENDIENTE
// ----------------------------------------------------------------------

exports.getPatientProfile = (req, res) => {
    // La lógica se implementará más adelante.
    res.status(501).json({ message: 'Ruta PENDIENTE: Obtener Perfil del Paciente.' });
};