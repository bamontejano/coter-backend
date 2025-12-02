// controllers/therapistController.js

const prisma = require('../utils/prismaClient'); 
const { Role } = require('@prisma/client'); 

// Función de utilidad para obtener el ID del usuario del token
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
                role: Role.PATIENT
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
        const patient = await prisma.user.findFirst({
            where: { 
                email: patientEmail, 
                role: Role.PATIENT
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Paciente no encontrado con ese email.' });
        }

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
// 3. CREAR OBJETIVO (POST /api/therapist/goals)
// ----------------------------------------------------------------------

exports.createGoal = async (req, res) => {
    const therapistId = getUserId(req);
    const { patientId, title, description, dueDate, metric, target } = req.body; 

    if (!patientId || !title || !dueDate) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (patientId, title, dueDate).' });
    }

    try {
        const patient = await prisma.user.findUnique({
            where: { id: patientId, therapistId: therapistId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'No tiene permiso para crear objetivos para este paciente.' });
        }

        const newGoal = await prisma.goal.create({
            data: {
                patientId: patientId,
                therapistId: therapistId,
                title: title,
                description: description || null,
                metric: metric || null, 
                target: target || null, 
                dueDate: new Date(dueDate), 
                status: 'PENDING' 
            }
        });

        res.status(201).json({ 
            message: 'Objetivo creado exitosamente.',
            goal: newGoal
        });

    } catch (error) {
        console.error("Error al crear objetivo:", error.message);
        res.status(500).json({ 
            message: 'Error interno al crear el objetivo.',
            details: error.message
        });
    }
};

// ----------------------------------------------------------------------
// 4. OBTENER OBJETIVOS DEL PACIENTE (GET /api/therapist/goals/:patientId)
// ----------------------------------------------------------------------

exports.getPatientGoals = async (req, res) => {
    const therapistId = getUserId(req);
    const patientId = req.params.patientId;

    try {
        const patient = await prisma.user.findUnique({
            where: { id: patientId, therapistId: therapistId }
        });

        if (!patient) {
            return res.status(403).json({ message: 'No tiene permiso para ver los objetivos de este paciente.' });
        }

        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
            orderBy: [
                { dueDate: 'asc' }, 
                { createdAt: 'desc' }
            ]
        });

        res.status(200).json(goals);
        
    } catch (error) {
        console.error("Error al obtener objetivos:", error.message);
        res.status(500).json({ 
            message: 'Error interno al obtener los objetivos.',
            details: error.message
        });
    }
};


// ----------------------------------------------------------------------
// 5. OBTENER PERFIL COMPLETO DE UN PACIENTE ESPECÍFICO (GET /api/therapist/patient/:patientId)
// ----------------------------------------------------------------------

exports.getPatientProfile = async (req, res) => {
    const therapistId = getUserId(req);
    const patientId = req.params.patientId;

    try {
        const patient = await prisma.user.findUnique({
            where: { id: patientId, therapistId: therapistId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
                // Incluir Check-ins ordenados por fecha descendente
                checkins: {
                    orderBy: {
                        date: 'desc' 
                    },
                    select: {
                        id: true,
                        moodScore: true,
                        notes: true,
                        date: true,
                        createdAt: true
                    }
                },
                // Incluir Metas ordenadas por fecha límite
                assignedGoals: {
                    orderBy: [
                        { dueDate: 'asc' }, 
                        { createdAt: 'desc' }
                    ]
                }
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Paciente no encontrado o no asignado a este terapeuta.' });
        }

        res.status(200).json(patient);

    } catch (error) {
        console.error("Error al obtener perfil del paciente:", error.message);
        res.status(500).json({ 
            message: 'Error interno al obtener el perfil del paciente.',
            details: error.message
        });
    }
};