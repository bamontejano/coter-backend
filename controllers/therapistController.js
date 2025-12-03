// controllers/therapistController.js

// ⚠️ Asegúrate de que esta ruta sea correcta para tu cliente de Prisma.
// Asumo que tienes un archivo que exporta el cliente (ej: ../prismaClient.js)
const prisma = require('../prismaClient'); 

// =========================================================================
// 1. ASIGNAR PACIENTE (POST /api/therapist/assign)
// Lógica que utiliza la tabla PatientTherapist
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
        // Busca usando el índice único (therapistId, patientId)
        const existingRelation = await prisma.patientTherapist.findUnique({
            where: {
                therapistId_patientId: {
                    therapistId: therapistId,
                    patientId: patientId,
                }
            }
        });

        // C. CREAR O ACTUALIZAR LA RELACIÓN
        if (existingRelation) {
            if (existingRelation.isActive === true) {
                 // Caso 1: Ya está asignada y activa
                return res.status(400).json({ message: `El paciente ${patientFirstName} ya está asignado a tu cuenta.` });
            } else {
                 // Caso 2: Restaurar (Si estaba archivada/inactiva)
                 await prisma.patientTherapist.update({
                     where: { id: existingRelation.id }, 
                     data: { isActive: true } 
                 });
                 return res.status(200).json({ 
                    message: `Paciente ${patientFirstName} restaurado y asignado correctamente.`
                });
            }
        } else {
             // Caso 3: Crear nueva relación
            await prisma.patientTherapist.create({ 
                data: { 
                    therapistId: therapistId, 
                    patientId: patientId, 
                    isActive: true,
                }
            });

            return res.status(200).json({ 
                message: `Paciente ${patientFirstName} asignado correctamente. Ya puedes ver sus datos.`
            });
        }

    } catch (error) {
        console.error("Error en la asignación:", error);
        res.status(500).json({ message: "Error interno del servidor al procesar la asignación." });
    }
};

// =========================================================================
// 2. OBTENER PACIENTES ASIGNADOS (GET /api/therapist/patients)
// =========================================================================
exports.getPatients = async (req, res) => {
    const therapistId = req.user.id;

    try {
        // Usa la nueva relación PatientTherapist para obtener los pacientes asignados
        const relations = await prisma.patientTherapist.findMany({
            where: { 
                therapistId: therapistId,
                isActive: true // Solo pacientes activos
            },
            include: {
                patient: { // Incluir los datos del usuario Paciente
                    select: {
                        id: true,
                        firstName: true,
                        email: true,
                    }
                }
            }
        });

        // Mapear el resultado para obtener una lista limpia de pacientes
        const patients = relations.map(rel => rel.patient);

        res.status(200).json({ 
            status: 'success', 
            results: patients.length,
            data: { patients } 
        });
    } catch (error) {
        console.error("Error al obtener pacientes:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 3. OBTENER PERFIL DE PACIENTE ESPECÍFICO (GET /api/therapist/patient/:patientId)
// =========================================================================
exports.getPatientProfile = async (req, res) => {
    const { patientId } = req.params;
    const therapistId = req.user.id;

    try {
        // 1. Verificar si el terapeuta está asignado a este paciente
        const isAssigned = await prisma.patientTherapist.findUnique({
            where: {
                therapistId_patientId: {
                    therapistId: therapistId,
                    patientId: patientId,
                },
                isActive: true
            }
        });

        if (!isAssigned) {
            return res.status(403).json({ message: "Acceso denegado. El paciente no está asignado a este terapeuta." });
        }
        
        // 2. Obtener el perfil del paciente
        const patient = await prisma.user.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                firstName: true,
                email: true,
                // Puedes incluir más datos aquí
            }
        });

        if (!patient) {
            return res.status(404).json({ message: "Paciente no encontrado." });
        }

        res.status(200).json({ 
            status: 'success', 
            data: { patient } 
        });

    } catch (error) {
        console.error("Error al obtener perfil del paciente:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// =========================================================================
// 4. CREAR META (POST /api/therapist/goals)
// Asume que el modelo 'Goal' existe en tu schema.prisma
// =========================================================================
exports.createGoal = async (req, res) => {
    const therapistId = req.user.id;
    const { patientId, description, metric, target } = req.body;

    try {
        const newGoal = await prisma.goal.create({
            data: {
                description,
                metric,
                target,
                patientId: patientId,
                therapistId: therapistId,
                status: 'ACTIVE', // Estado inicial por defecto
            }
        });

        res.status(201).json({ 
            status: 'success', 
            data: { goal: newGoal } 
        });

    } catch (error) {
        console.error("Error al crear la meta:", error);
        res.status(500).json({ message: "Error interno del servidor al crear la meta. Asegúrate de que el modelo 'Goal' existe y tiene los campos correctos." });
    }
};

// =========================================================================
// 5. OBTENER METAS DE PACIENTE (GET /api/therapist/goals/:patientId)
// =========================================================================
exports.getPatientGoals = async (req, res) => {
    const { patientId } = req.params;
    const therapistId = req.user.id;
    
    try {
        const goals = await prisma.goal.findMany({
            where: {
                patientId: patientId,
                therapistId: therapistId, // Filtra por metas asignadas por el terapeuta logueado
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
    const updateData = req.body; // { description, metric, target, status, etc. }

    try {
        const updatedGoal = await prisma.goal.update({
            where: { 
                id: goalId,
                therapistId: therapistId // Solo permite actualizar si la meta fue creada por este terapeuta
            },
            data: updateData,
        });

        res.status(200).json({ 
            status: 'success', 
            data: { goal: updatedGoal } 
        });

    } catch (error) {
        console.error("Error al actualizar la meta:", error);
        // P2025 es el código de error de Prisma para 'registro no encontrado'
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Meta no encontrada o no tienes permiso para modificarla." });
        }
        res.status(500).json({ message: "Error interno del servidor." });
    }
};