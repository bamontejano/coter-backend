// controllers/patientController.js (CON MEJOR MANEJO DE ERRORES DE PRISMA)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ----------------------------------------------------------------------
// 1. CREAR NUEVO CHECK-IN (POST /api/patient/checkin)
// ----------------------------------------------------------------------

exports.createCheckin = async (req, res) => {
    // Comprobación de seguridad: asegura que req.user exista y tenga un ID
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Error de autenticación. Por favor, vuelva a iniciar sesión." });
    }

    const patientId = req.user.id; 
    const { moodScore, notes } = req.body; 

    // Validación de datos
    if (!moodScore) {
        return res.status(400).json({ message: 'El puntaje de ánimo (moodScore) es obligatorio para el check-in.' });
    }
    if (moodScore < 1 || moodScore > 10) {
        return res.status(400).json({ message: 'El puntaje de ánimo debe estar entre 1 y 10.' });
    }

    try {
        const newCheckin = await prisma.checkin.create({
            data: {
                patientId: patientId,
                moodScore: parseInt(moodScore),
                notes: notes || null,
            }
        });

        res.status(201).json({ 
            message: 'Check-in registrado exitosamente.',
            checkin: newCheckin
        });

    } catch (error) {
        // 🚨 CRÍTICO: Devolver el error detallado de Prisma al frontend
        console.error("Error al crear check-in (Prisma/DB):", error);
        
        // El error de Prisma P2025 es "Registro no encontrado", pero P2002 es duplicado.
        // El error más común aquí será un error general de validación de esquema.
        
        let errorMessage = 'Error interno al registrar el check-in. ';

        if (error.code && error.meta) {
            errorMessage += `Código Prisma: ${error.code}. Detalle: ${JSON.stringify(error.meta)}`;
        } else {
            errorMessage += `Detalle: ${error.message}`;
        }

        res.status(500).json({ 
            message: errorMessage,
            details: error.message
        });
    }
};

// ... Las demás funciones (getAssignedGoals, etc.) pueden quedarse como estaban
// ...