// server.js

// 1. Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // 🚨 CORRECCIÓN CRÍTICA: Importación de la librería 'path'

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const patientRoutes = require('./routes/patientRoutes'); 

// ⚠️ Usar process.env.PORT (asignado por Render) como prioridad.
const PORT = process.env.PORT || 10000; 

// Inicializar la aplicación Express
const app = express();

// ------------------------------
// MIDDLEWARE GLOBAL
// ------------------------------

// Habilitar CORS para permitir que el frontend acceda al backend
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware para parsear bodies de requests como JSON
app.use(express.json());

// ------------------------------
// CONFIGURACIÓN PARA SERVIR EL FRONTEND (Archivos Estáticos)
// ------------------------------

// 1. Servir todos los archivos estáticos (incluyendo index.html, therapist.html, CSS, JS) 
// desde la raíz del proyecto.
app.use(express.static(path.join(__dirname, '/'))); 

// 2. Definir explícitamente la ruta raíz '/'
// Esta ruta garantiza que al acceder a https://tu-dominio.onrender.com/ se envíe index.html.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// 3. Ruta necesaria para la redirección del terapeuta desde index.html
app.get('/therapist.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'therapist.html'));
});

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
// Manejo de rutas no encontradas (404)
// ------------------------------

// Este middleware captura cualquier otra ruta que no sea estática o API
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found - La ruta solicitada no existe en la API.' });
});

// ------------------------------
// INICIO DEL SERVIDOR
// ------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
});