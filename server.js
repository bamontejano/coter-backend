// server.js

// En server.js (o un archivo temporal)
const prisma = require('./utils/prismaClient'); // Asegúrate de que la ruta sea correcta

async function testDbConnection() {
    try {
        await prisma.$connect();
        console.log('✅ BASE DE DATOS: Conexión a Neon exitosa.');
    } catch (error) {
        console.error('❌ BASE DE DATOS: ¡FALLÓ LA CONEXIÓN A NEON!');
        console.error('Detalles del error:', error.message);
        // Esto forzará un error visible en los logs si la conexión falla
        process.exit(1); 
    }
}

// Llama a esta función al inicio del servidor
// testDbConnection();
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