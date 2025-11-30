// controllers/therapistController.js

exports.getPatients = async (req, res) => {
    try {
        // ⚠️ REEMPLAZAMOS la consulta de Prisma por un MOCK (Temporal)
        const patients = [
            { id: 99, firstName: "Paciente", lastName: "De Prueba", email: "mock@prueba.com" }
        ];

        // ⚠️ Nota: No hay consulta a Prisma, por lo que no hace falta el await prisma.user...

        return res.status(200).json(patients); // Esto DEBE funcionar
        
    } catch (error) {
        // ... (El catch sigue devolviendo el error JSON)
        return res.status(500).json({ 
            message: 'Error interno del servidor al obtener la lista de pacientes.',
            details: error.message 
        });
    }
};