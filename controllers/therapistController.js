// controllers/therapistController.js (CORRECCIÓN assignPatient)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
// Asumiendo que su archivo tiene 'const jwt = require('jsonwebtoken');' si usa signToken.

// ... (todas sus otras funciones: getPatients, getPatientProfile, etc., deben estar aquí)

// =========================================================================
// 1. ASIGNAR PACIENTE (POST /api/therapist/assign)
// =========================================================================
exports.assignPatient = async (req, res) => {
    const { patientEmail } = req.body; 
    const therapistId = req.user.id; 

    if (!patientEmail) {
        return res.status(400).json({ message: "El email del paciente es obligatorio." });
    }
    
    // 🚨 CORRECCIÓN CRÍTICA: Limpiar el email de espacios en blanco y ponerlo en minúsculas
    const cleanedEmail = patientEmail.trim().toLowerCase(); 

    try {
        // Búsqueda más robusta por el email limpio
        const patient = await prisma.user.findUnique({ 
            where: { email: cleanedEmail } 
        }); 

        if (!patient) {
            // El mensaje de error ahora es más claro
            return res.status(404).json({ message: `Usuario con el email ${patientEmail} no registrado.` });
        }
        
        if (patient.role !== 'PATIENT') {
            return res.status(400).json({ message: "Solo se puede asignar a un paciente." });
        }
        
        if (patient.therapistId === therapistId) {
            return res.status(400).json({ message: "Este paciente ya está asignado a usted." });
        }

        // B. ASIGNAR PACIENTE
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

// ... (Incluya aquí las otras funciones: getPatients, getPatientGoals, etc.)