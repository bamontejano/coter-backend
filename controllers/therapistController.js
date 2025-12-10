// controllers/therapistController.js (VERSIÓN FINAL Y SIN ERRORES DE SINTAXIS)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
const jwt = require('jsonwebtoken');

// Función helper para generar el token JWT (necesaria si la usas en authController)
const signToken = (id, role) => { 
    const secret = process.env.JWT_SECRET || 'SECRETO_DEV_2025';
    const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
    
    return jwt.sign({ id, role }, secret, { expiresIn: expiresIn });
};

// =========================================================================
// 1. ASIGNAR PACIENTE (POST /api/therapist/assign)
// =========================================================================
exports.assignPatient = async (req, res) => {
    const { patientEmail } = req.body; 
    const therapistId = req.user.id; 

    if (!patientEmail) {
        return res.status(400).json({ message: "El email del paciente es obligatorio." });
    }
    
    const cleanedEmail = patientEmail.trim().toLowerCase(); 

    try {
        const patient = await prisma.user.findUnique({ 
            where: { email: cleanedEmail } 
        }); 

        if (!patient) {
            return res.status(404).json({ message: `Usuario con el email ${patientEmail} no registrado.` });
        }
        
        if (patient.role !== 'PATIENT') {
            return res.status(400).json({ message: "Solo se puede asignar a un paciente." });
        }
        
        if (patient.therapistId === therapistId) {
            return res.status(400).json({ message: "Este paciente ya está asignado a usted." });
        }

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
exports.getPatients = async (req, res) => { // 🚨 ESTA ES LA FUNCIÓN CRÍTICA
    const therapistId = req.user.id; 
    
    try {
        const patients = await prisma.user.findMany({
            where: {
                therapistId: therapistId, 
                role: 'PATIENT'           
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
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

// =========================================================================
// 3. OBTENER PERFIL DEL PACIENTE (GET /api/therapist/patient/:patientId)
// =========================================================================
exports.getPatientProfile = async (req, res) => {
    const { patientId } = req.params;
    const therapistId = req.user.id; 
    
    try {
        const patient = await prisma.user.findUnique({
            where: { 
                id: patientId,
                therapistId: therapistId, 
                role: 'PATIENT'
            },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                createdAt: true 
            }
        });

        if (!patient) {
            return res.status(404).json({ message: "Paciente no encontrado o no asignado a usted." });
        }

        res.status(200).json({ status: 'success', data: { patient } });
        
    } catch (error) {
        console.error("Error al obtener perfil del paciente:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 4. CREAR META (POST /api/therapist/goals)
// =========================================================================
exports.createGoal = async (req, res) => {
    const { patientId, name, description, dueDate, targetMetric } = req.body;
    const therapistId = req.user.id;

    if (!patientId || !name || !dueDate) {
        return res.status(400).json({ message: 'Campos requeridos faltantes: patientId, name, dueDate.' });
    }

    try {
        const patient = await prisma.user.findUnique({
            where: { id: patientId, therapistId: therapistId, role: 'PATIENT' }
        });

        if (!patient) {
            return res.status(404).json({ message: "Paciente no encontrado o no asignado a este terapeuta." });
        }

        const newGoal = await prisma.goal.create({
            data: {
                patientId: patientId,
                therapistId: therapistId, 
                name,
                description,
                dueDate: new Date(dueDate),
                targetMetric: targetMetric || null,
            }
        });

        res.status(201).json({ 
            status: 'success', 
            message: 'Meta creada exitosamente.',
            data: { goal: newGoal } 
        });

    } catch (error) {
        console.error("Error al crear la meta:", error.message);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 5. OBTENER METAS DE UN PACIENTE (GET /api/therapist/goals/:patientId)
// =========================================================================
exports.getPatientGoals = async (req, res) => {
    const { patientId } = req.params;
    const therapistId = req.user.id;

    try {
        const patient = await prisma.user.findUnique({
             where: { id: patientId, therapistId: therapistId, role: 'PATIENT' }
        });

        if (!patient) {
            return res.status(404).json({ message: "Paciente no encontrado o no asignado a este terapeuta." });
        }
        
        const goals = await prisma.goal.findMany({
            where: { patientId: patientId },
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

// =========================================================================
// 6. ACTUALIZAR META (PATCH /api/therapist/goals/:goalId)
// =========================================================================
exports.updateGoal = async (req, res) => {
    const { goalId } = req.params;
    const therapistId = req.user.id;
    const updateData = req.body;

    try {
        const updatedGoal = await prisma.goal.update({
            where: { 
                id: goalId,
                therapistId: therapistId 
            },
            data: updateData,
        });

        res.status(200).json({ 
            status: 'success', 
            data: { goal: updatedGoal } 
        });

    } catch (error) {
        console.error("Error al actualizar la meta:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Meta no encontrada o no es propiedad de este terapeuta." });
        }
        res.status(500).json({ message: "Error interno del servidor." });
    }
};