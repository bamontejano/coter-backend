// server.js

// 1. Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // CRÍTICO: Asegurarse de que 'path' está importado

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

// Habilitar CORS
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middleware para parsear bodies de requests como JSON
app.use(express.json());

// -------------------------------------------------------------
// 1. CONFIGURACIÓN PARA SERVIR EL FRONTEND (Archivos Estáticos) ⬅️ ESTO DEBE IR PRIMERO
// -------------------------------------------------------------

// Servir todos los archivos estáticos (CSS, JS, imágenes) desde la raíz del proyecto.
app.use(express.static(path.join(__dirname, '/'))); 

// Definir explícitamente la ruta raíz '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Ruta necesaria para la redirección del terapeuta
app.get('/therapist.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'therapist.html'));
});


// ------------------------------
// 2. RUTAS API
// ------------------------------

// Rutas de Autenticación (Registro, Login)
app.use('/api/auth', authRoutes);

// Rutas del Terapeuta (Pacientes, Metas)
app.use('/api/therapist', therapistRoutes);

// Rutas del Paciente (Check-ins, Metas)
app.use('/api/patient', patientRoutes); 


// ------------------------------
// 3. INICIO DEL SERVIDOR
// ------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
});