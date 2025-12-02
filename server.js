// server.js

// 1. Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
// const patientRoutes = require('./routes/patientRoutes'); // Se puede descomentar cuando se implemente

// ⚠️ CORRECCIÓN CRÍTICA: Usar process.env.PORT (asignado por Render) como prioridad.
const PORT = process.env.PORT || 10000; 

// Inicializar la aplicación Express
const app = express();

// ------------------------------
// MIDDLEWARE GLOBAL
// ------------------------------

// Habilitar CORS para permitir que el frontend acceda al backend
const corsOptions = {
    origin: '*', // Permite todas las URLs (ideal para desarrollo y despliegue simple)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware para parsear bodies de requests como JSON
app.use(express.json());

// ------------------------------
// RUTAS
// ------------------------------

// Ruta principal de prueba
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Bienvenido a la API Coter. Accede a /api/auth/register o /api/therapist/patients' 
    });
});

// Rutas de Autenticación (Registro, Login)
app.use('/api/auth', authRoutes);

// Rutas del Terapeuta (Pacientes, Metas)
app.use('/api/therapist', therapistRoutes);

// Rutas del Paciente (Check-ins, Metas)
// app.use('/api/patient', patientRoutes); // Se puede habilitar después de crearlas

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// ------------------------------
// INICIO DEL SERVIDOR
// ------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});