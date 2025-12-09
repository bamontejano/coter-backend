// server.js

// 1. Cargar variables de entorno del archivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // Librería path necesaria

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const patientRoutes = require('./routes/patientRoutes'); 

const PORT = process.env.PORT || 10000; 
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
app.use(express.json());

// ------------------------------
// CONFIGURACIÓN PARA SERVIR EL FRONTEND (Archivos Estáticos)
// ------------------------------

// 🚨 CORRECCIÓN DEFINITIVA: Servir todos los archivos estáticos desde la raíz del proyecto.
// Esto maneja automáticamente:
// 1. La ruta raíz / (servirá index.html si existe).
// 2. La ruta /therapist.html.
// 3. Los archivos externos como CSS y JS.
app.use(express.static(path.join(__dirname, '/'))); 

// ------------------------------
// RUTAS API (Siempre deben ir bajo un prefijo como /api)
// ------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/patient', patientRoutes); 

// ------------------------------
// Manejo de rutas no encontradas (404)
// ------------------------------

// Este middleware captura CUALQUIER otra ruta que NO haya sido manejada por 
// express.static (frontend) o por las rutas /api/.
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found - La ruta solicitada no existe en la API.' });
});

// ------------------------------
// INICIO DEL SERVIDOR
// ------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
});