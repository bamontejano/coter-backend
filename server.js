// server.js

// Importación de módulos Node
const dotenv = require('dotenv');
dotenv.config(); // 1. Cargar variables de entorno PRIMERO

const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 5000;

// ⚠️ Importación del cliente de Prisma: Asegúrate de que esta ruta es correcta
const prisma = require('./utils/prismaClient'); 

// ----------------------------------------------------
// FUNCIÓN OPCIONAL PARA TESTEAR LA CONEXIÓN A NEON
// ----------------------------------------------------

// Función para testear la conexión a la DB (descomentar para usar)
/*
async function testDbConnection() {
    try {
        await prisma.$connect();
        console.log('✅ BASE DE DATOS: Conexión a Neon exitosa.');
    } catch (error) {
        console.error('❌ BASE DE DATOS: ¡FALLÓ LA CONEXIÓN A NEON!');
        console.error('Detalles del error:', error.message);
        process.exit(1); 
    }
}
// testDbConnection(); 
*/

// ----------------------------------------------------
// MIDDLEWARES GLOBALES
// ----------------------------------------------------

// 1. Middleware CORS: Necesario para que el frontend (Render) pueda acceder
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware para parsear JSON (convierte el body de las peticiones a objetos JS)
app.use(express.json());

// ----------------------------------------------------
// CONEXIÓN DE RUTAS
// ----------------------------------------------------

// Importación de archivos de rutas
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes'); // ⬅️ ¡CORREGIDO: Importar router de Terapeuta!

// 1. Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).send('Servidor Coter Backend funcionando. ¡Conectado!');
});

// 2. Rutas de Autenticación
app.use('/api/auth', authRoutes);

// 3. Rutas del Terapeuta ⬅️ ¡CORREGIDO: Conectar el router de Terapeuta!
// Sin esta línea, Express devuelve un 404 a la ruta /api/therapist/patients
app.use('/api/therapist', therapistRoutes); 

const patientRoutes = require('./routes/patientRoutes'); // ⬅️ Nuevo require
app.use('/api/patient', patientRoutes); // ⬅️ Conectar el nuevo router

// ... (Aquí irían otras rutas como checkinRoutes, goalRoutes, etc.)


// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});