// controllers/patientController.js

const prisma = require('../utils/prismaClient'); 

// ----------------------------------------------------
// 1. OBTENER PERFIL PROPIO (GET /api/patient/me)
// ----------------------------------------------------
exports.getPatientProfile = async (req, res) => {
    const userId = req.user.id; 

    try {
        const patient = await prisma.user.findUnique({
            where: { id: userId, role: 'PATIENT' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                therapistId: true, 
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Perfil de paciente no encontrado.' });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error("Error al obtener perfil:", error.message);
        res.status(500).json({ message: 'Error interno al obtener el perfil.' });
    }
};

// ----------------------------------------------------
// 2. OBTENER OBJETIVOS ASIGNADOS (GET /api/patient/goals)
// ----------------------------------------------------
exports.getGoals = async (req, res) => {
    const patientId = req.user.id;

    try {
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

// ----------------------------------------------------
// 3. REGISTRAR CHECK-IN (POST /api/patient/checkin) - CORREGIDO
// ----------------------------------------------------
exports.createCheckIn = async (req, res) => {
    const patientId = req.user.id;
    // Utilizamos los campos de tu schema.prisma
    const { mood, anxiety, energy, thoughts } = req.body; 

    if (!mood || !anxiety || !energy) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el check-in (mood, anxiety, energy).' });
    }

    try {
        const newCheckIn = await prisma.checkIn.create({ 
            data: {
                patientId: patientId,
                mood: mood,
                anxiety: anxiety,
                energy: energy,
                thoughts: thoughts || null,
            }
        });

        res.status(201).json({ message: 'Check-In registrado exitosamente.', checkIn: newCheckIn });
    } catch (error) {
        console.error("Error al registrar check-in:", error.message);
        res.status(500).json({ message: 'Error interno al registrar el check-in.' });
    }
};

// ----------------------------------------------------
// 4. ACTUALIZAR ESTADO DE OBJETIVO (PATCH /api/patient/goals/:goalId)
// ----------------------------------------------------
exports.updateGoalStatus = async (req, res) => {
    const patientId = req.user.id;
    const goalId = req.params.goalId;
    const { status } = req.body; 

    if (!status) {
        return res.status(400).json({ message: 'Se requiere el nuevo estado del objetivo.' });
    }

    try {
        const updatedGoal = await prisma.goal.update({
            where: { 
                id: goalId, 
                patientId: patientId 
            },
            data: { status: status }
        });

        res.status(200).json({ message: `Estado del objetivo ${goalId} actualizado a ${status}.`, goal: updatedGoal });
    } catch (error) {
        console.error("Error al actualizar objetivo:", error.message);
        res.status(500).json({ message: 'Error interno o objetivo no encontrado/no pertenece al paciente.' });
    }
};


// ----------------------------------------------------------------------
// 5. OBTENER ASIGNACIONES (TAREAS) - GET /api/patient/assignments
// ----------------------------------------------------------------------
exports.getAssignments = async (req, res) => {
    const patientId = req.user.id;

    try {
        const assignments = await prisma.assignment.findMany({
            where: { patientId: patientId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error al obtener tareas:", error.message);
        res.status(500).json({ message: 'Error interno al obtener las tareas.' });
    }
};

// ----------------------------------------------------------------------
// 6. ACTUALIZAR ESTADO DE ASIGNACIÓN - PATCH /api/patient/assignments/:assignmentId
// ----------------------------------------------------------------------
exports.updateAssignmentStatus = async (req, res) => {
    const patientId = req.user.id;
    const assignmentId = req.params.assignmentId;
    const { status } = req.body; 

    if (!status) {
        return res.status(400).json({ message: 'Se requiere el nuevo estado de la tarea.' });
    }
    
    try {
        const updatedAssignment = await prisma.assignment.update({
            where: { 
                id: assignmentId, 
                patientId: patientId // Crucial: Solo el dueño puede actualizar
            },
            data: { status: status }
        });

        res.status(200).json({ message: `Estado de la tarea ${assignmentId} actualizado a ${status}.`, assignment: updatedAssignment });
    } catch (error) {
        console.error("Error al actualizar tarea:", error.message);
        res.status(500).json({ message: 'Error interno o tarea no encontrada/no pertenece al paciente.' });
    }
};


// ----------------------------------------------------------------------
// 7. OBTENER MENSAJES (Conversación) - GET /api/patient/messages
// ----------------------------------------------------------------------
exports.getMessages = async (req, res) => {
    const userId = req.user.id;
    
    // Obtenemos el ID del terapeuta asignado
    const patient = await prisma.user.findUnique({ where: { id: userId }, select: { therapistId: true } });
    const therapistId = patient ? patient.therapistId : null;

    if (!therapistId) {
        // Devolvemos un array vacío si no hay conversación posible
        return res.status(200).json([]); 
    }

    try {
        // Consulta para obtener mensajes intercambiados entre el paciente y su terapeuta
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: therapistId },
                    { senderId: therapistId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' } // Para orden cronológico
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error al obtener mensajes:", error.message);
        res.status(500).json({ message: 'Error interno al obtener los mensajes.' });
    }
};

// ----------------------------------------------------------------------
// 8. ENVIAR MENSAJE AL TERAPEUTA - POST /api/patient/messages
// ----------------------------------------------------------------------
exports.sendMessage = async (req, res) => {
    const senderId = req.user.id; // ID del paciente
    const { receiverId, content } = req.body; // receiverId es el therapistId
    
    if (!receiverId || !content) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (receiverId y content).' });
    }

    // 1. Verificación de seguridad: Asegurar que el receptor es el terapeuta asignado
    const patient = await prisma.user.findUnique({ where: { id: senderId } });
    if (!patient || patient.therapistId !== receiverId) {
        return res.status(403).json({ message: 'No se puede enviar mensajes a este usuario. No es su terapeuta asignado.' });
    }

    try {
        const newMessage = await prisma.message.create({
            data: {
                senderId: senderId,
                receiverId: receiverId,
                content: content
            }
        });

        res.status(201).json({ message: 'Mensaje enviado exitosamente.', message: newMessage });
    } catch (error) {
        console.error("Error al enviar mensaje:", error.message);
        res.status(500).json({ message: 'Error interno al enviar el mensaje.' });
    }
};