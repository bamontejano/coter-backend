// controllers/therapistController.js (CORREGIDO)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// 🚨 Se eliminó la función signToken ya que no se usaba en este archivo 
// y causaba una dependencia no importada (jwt).

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
            return res.status(400).json({ message: `Error: El usuario ${patient.firstName} no es un paciente.` });
        }

        const patientId = patient.id; 
        const patientFirstName = patient.firstName || 'Paciente';

        // B. VERIFICAR RELACIÓN EXISTENTE
        const existingRelationship = await prisma.patientTherapist.findFirst({
            where: {
                patientId: patientId,
                therapistId: therapistId
            }
        });

        if (existingRelationship) {
            return res.status(409).json({ message: `${patientFirstName} ya está asignado a este terapeuta.` });
        }

        // C. CREAR RELACIÓN
        await prisma.patientTherapist.create({
            data: {
                patientId: patientId,
                therapistId: therapistId,
            }
        });

        res.status(200).json({ 
            status: 'success', 
            message: `${patientFirstName} ha sido asignado con éxito.` 
        });

    } catch (error) {
        console.error("Error al asignar paciente:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 2. OBTENER LISTA DE PACIENTES (GET /api/therapist/patients)
// =========================================================================
exports.getPatients = async (req, res) => {
    const therapistId = req.user.id;

    try {
        // A. Obtener las relaciones del terapeuta actual
        const relationships = await prisma.patientTherapist.findMany({
            where: { therapistId },
            include: {
                patient: { // Incluye los datos del usuario paciente asociado
                    select: {
                        id: true,
                        firstName: true,
                        email: true,
                        role: true,
                    }
                }
            }
        });

        // B. Mapear la lista para obtener solo los datos del paciente
        const patients = relationships.map(rel => rel.patient);

        // NOTA: El frontend debe esperar la estructura de datos que se envía aquí.
        res.status(200).json({ 
            status: 'success', 
            results: patients.length,
            data: { patients } 
        });

    } catch (error) {
        console.error("Error al obtener lista de pacientes:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};


// =========================================================================
// 3. OBTENER PERFIL DEL PACIENTE (GET /api/therapist/patient/:patientId)
// =========================================================================
exports.getPatientProfile = async (req, res) => {
    const { patientId } = req.params; 
    const therapistId = req.user.id; 

    try {
        // A. Verificar la relación existente
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
        
        // C. OBTENER DATOS RELACIONADOS POR SEPARADO
        const checkins = await prisma.checkin.findMany({
            where: { patientId: patientId },
            orderBy: { date: 'desc' }, 
            take: 10 
        });

        const goals = await prisma.goal.findMany({ 
            where: {
                patientId: patientId,
                therapistId: therapistId 
            },
            orderBy: { dueDate: 'asc' }
        });
        
        // D. Limpiar el perfil antes de enviar y combinarlos
        const { password, ...safeProfile } = patientProfile;
        
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
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 4. CREAR META (POST /api/therapist/goals)
// =========================================================================
exports.createGoal = async (req, res) => {
    const { patientId, title, description, dueDate, metric, target } = req.body;
    const therapistId = req.user.id;

    if (!patientId || !title || !dueDate) {
        return res.status(400).json({ message: "Faltan campos obligatorios para la meta." });
    }

    try {
        // A. Verificar la relación terapeuta-paciente antes de crear la meta
        const relationship = await prisma.patientTherapist.findFirst({
            where: { patientId: patientId, therapistId: therapistId }
        });

        if (!relationship) {
            return res.status(403).json({ message: "Acceso denegado. Solo puedes asignar metas a tus pacientes." });
        }

        // B. Crear la meta
        const newGoal = await prisma.goal.create({
            data: {
                patientId: patientId,
                therapistId: therapistId, 
                title,
                description,
                dueDate: new Date(dueDate),
                metric,
                target: target ? parseInt(target) : null,
                status: 'PENDING',
            }
        });

        res.status(201).json({ 
            status: 'success', 
            data: { goal: newGoal } 
        });

    } catch (error) {
        console.error("Error al crear meta:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};


// =========================================================================
// 5. OBTENER METAS DEL PACIENTE (GET /api/therapist/goals/:patientId)
// =========================================================================
exports.getPatientGoals = async (req, res) => {
    const { patientId } = req.params;
    const therapistId = req.user.id;

    try {
        // A. Verificar la relación antes de devolver las metas
        const relationship = await prisma.patientTherapist.findFirst({
            where: { patientId: patientId, therapistId: therapistId }
        });
        
        if (!relationship) {
            return res.status(403).json({ message: "Acceso denegado. No tiene permisos para ver las metas de este paciente." });
        }

        // B. Obtener metas. Filtramos para asegurarnos de que solo se vean las que fueron creadas por ESTE terapeuta.
        const goals = await prisma.goal.findMany({
            where: { 
                patientId: patientId,
                therapistId: therapistId,
            },
            orderBy: { createdAt: 'desc' }
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
        // Aseguramos que solo el terapeuta que creó la meta puede actualizarla
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
            return res.status(404).json({ message: "Meta no encontrada o no tiene permisos para actualizarla." });
        }
        res.status(500).json({ message: "Error interno del servidor." });
    }
};