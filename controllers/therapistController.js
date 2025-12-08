// controllers/therapistController.js

// 🚨 CORRECCIÓN CRÍTICA: Importación directa del cliente de Prisma para evitar el error 'MODULE_NOT_FOUND' en Render
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

// =========================================================================
// 1. ASIGNAR PACIENTE (POST /api/therapist/assign)
// =========================================================================
exports.assignPatient = async (req, res) => {
    const { patientEmail } = req.body; 
    const therapistId = req.user.id; // ID del terapeuta (viene del middleware)

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
        // Busca si ya hay una relación entre estos dos IDs
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
    // Aseguramos que el patientId es un string (viene de req.params)
    const { patientId } = req.params; 
    const therapistId = req.user.id; // Del middleware

    try {
        // 🚨 CORRECCIÓN CLAVE: Usamos findFirst en lugar de findUnique con clave compuesta.
        // Esto verifica de forma robusta la relación existente.
        const relationship = await prisma.patientTherapist.findFirst({
            where: {
                patientId: patientId,
                therapistId: therapistId,
            }
        });

        if (!relationship) {
            // Devolver 403 si el terapeuta no tiene permiso para ver a este paciente.
            return res.status(403).json({ message: "Acceso denegado. El paciente no está asignado a este terapeuta." });
        }

        // B. Obtener el perfil completo del paciente
        const patientProfile = await prisma.user.findUnique({
            where: { id: patientId },
            include: {
                checkins: { 
                    orderBy: { date: 'desc' }, 
                    take: 10 // Últimos 10 check-ins
                },
                // Aseguramos que solo vemos las metas creadas por el terapeuta actual
                goals: { 
                    where: {
                        therapistId: therapistId
                    },
                    orderBy: { dueDate: 'asc' }
                }
            }
        });

        if (!patientProfile) {
            return res.status(404).json({ message: "Perfil del paciente no encontrado." });
        }

        // C. Limpiar el perfil antes de enviar
        // Remove sensitive data (like the hashed password)
        const { password, ...safeProfile } = patientProfile;

        res.status(200).json({ 
            status: 'success', 
            data: { patient: safeProfile } 
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
    // patientId es obligatorio en el body
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
                therapistId: therapistId, // Asignar el terapeuta que la crea
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
                therapistId: therapistId // Condición de propiedad
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
            // El objetivo a actualizar no existe o no pertenece al terapeuta
            return res.status(404).json({ message: "Meta no encontrada o no tiene permisos para actualizarla." });
        }
        res.status(500).json({ message: "Error interno del servidor." });
    }
};