// server.js

// 1. Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // 🚨 CORRECCIÓN CRÍTICA: Librería 'path' importada

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const patientRoutes = require('./routes/patientRoutes'); 

// ⚠️ CRÍTICO: Usar process.env.PORT (asignado por Render) como prioridad.
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
// RUTAS API
// ------------------------------

// Rutas de Autenticación (Registro, Login)
app.use('/api/auth', authRoutes);

// Rutas del Terapeuta (Pacientes, Metas)
app.use('/api/therapist', therapistRoutes);

// Rutas del Paciente (Check-ins, Metas)
app.use('/api/patient', patientRoutes); 

// ------------------------------
// CONFIGURACIÓN PARA SERVIR EL FRONTEND
// ------------------------------

// 🚨 CORRECCIÓN 1: Eliminamos la ruta de prueba JSON duplicada.
// 🚨 CORRECCIÓN 2: Esta ruta ahora se asegura de servir index.html correctamente
// cuando el usuario acceda a la URL raíz (https://tu-dominio.onrender.com/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Ruta necesaria para la redirección del terapeuta desde index.html
app.get('/therapist.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'therapist.html')); 
});

// Manejo de rutas no encontradas (404) - ¡Debe ir después de todas las rutas definidas!
app.use((req, res, next) => {
    // Si la ruta no es / o /therapist.html o /api/..., devuelve 404
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// ------------------------------
// INICIO DEL SERVIDOR
// ------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});