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

// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN PARA SERVIR EL FRONTEND (Archivos Estáticos) ⬅️ PRIMERO
// --------------------------------------------------------------------------

// Servir todos los archivos estáticos (CSS, JS, imágenes, etc.) desde la raíz del proyecto.
// Usamos path.resolve para garantizar la ruta absoluta al directorio en cualquier entorno.
app.use(express.static(path.resolve(__dirname, './'))); 


// ------------------------------
// 2. RUTAS API
// ------------------------------

// Rutas de Autenticación (Registro, Login)
app.use('/api/auth', authRoutes);

// Rutas del Terapeuta (Pacientes, Metas)
app.use('/api/therapist', therapistRoutes);

// Rutas del Paciente (Check-ins, Metas)
app.use('/api/patient', patientRoutes); 


// -------------------------------------------------------------------------
// 3. RUTA CATCH-ALL O FALLBACK ⬅️ CRÍTICO PARA EL PROBLEMA DE PANTALLA EN BLANCO
// -------------------------------------------------------------------------

// Esta ruta debe ir al FINAL. Si ninguna ruta de API o archivo estático (como /index.html)
// es encontrado, Express siempre intentará enviar el archivo index.html.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});


// ------------------------------
// 4. INICIO DEL SERVIDOR
// ------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
});