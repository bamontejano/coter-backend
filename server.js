// server.js

// 1. Cargar variables de entorno PRIMERO
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors'); // ✨ Importar el módulo CORS
const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// MIDDLEWARES GLOBALES
// ----------------------------------------------------

// 1. Middleware CORS: Usa el módulo estándar para manejar correctamente OPTIONS
app.use(cors({
    origin: '*', // Permite solicitudes desde cualquier origen (tu HTML local y Render)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware para parsear JSON
app.use(express.json());

// ----------------------------------------------------
// CONEXIÓN DE RUTAS
// ----------------------------------------------------

// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).send('Servidor Coter Backend funcionando. ¡Conectado!');
});

// Conectar Rutas (el resto de tus require() y app.use() va aquí...)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ... (resto de rutas: therapistRoutes, checkinRoutes, goalRoutes, etc.)

// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});