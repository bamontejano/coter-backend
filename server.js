// server.js
const express = require('express');
const dotenv = require('dotenv');

// Cargar variables de entorno (incluyendo PORT, DATABASE_URL, JWT_SECRET)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Usar el puerto 5000 por defecto si no está en .env

// ----------------------------------------------------
// MIDDLEWARES GLOBALES
// ----------------------------------------------------

// 1. Middleware para parsear JSON: Permite que Express lea el cuerpo de las peticiones en formato JSON
app.use(express.json());

// 2. Middleware CORS: Necesario para que tu frontend (index.html) pueda hablar con el backend
app.use((req, res, next) => {
    // ⚠️ En producción, reemplazar '*' con el dominio específico de tu frontend
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// ----------------------------------------------------
// CONEXIÓN DE RUTAS
// ----------------------------------------------------

// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).send('Servidor Coter Backend funcionando. ¡Conectado!');
});

// 1. Conectar Rutas de Autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); 

// 2. Conectar Rutas del Terapeuta
const therapistRoutes = require('./routes/therapistRoutes');
app.use('/api/therapist', therapistRoutes); 

// 3. Conectar Rutas de Check-ins
const checkinRoutes = require('./routes/checkinRoutes');
app.use('/api/checkins', checkinRoutes); 

// 4. Conectar Rutas de Metas (¡NUEVO!)
const goalRoutes = require('./routes/goalRoutes');
app.use('/api/goals', goalRoutes); 

// 5. Conectar Rutas de Asignaciones (¡NUEVO!)
const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);

// 6. Conectar Rutas de Mensajería (¡NUEVO!)
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes); 
// Ejemplos: POST /api/messages, GET /api/messages/inbox

// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});