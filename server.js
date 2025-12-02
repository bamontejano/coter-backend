// server.js

// Importación de módulos Node
const dotenv = require('dotenv');
dotenv.config(); 

const express = require('express');
const cors = require('cors'); 
const app = express();

// 🛠️ CORRECCIÓN: Agregar trust proxy para Render
app.set('trust proxy', 1); 

const PORT = process.env.PORT || 5000;

// Importación del cliente de Prisma
const prisma = require('./utils/prismaClient'); 

// ... (Bloque testDbConnection omitido por brevedad) ...

// ----------------------------------------------------
// MIDDLEWARES GLOBALES
// ----------------------------------------------------

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ----------------------------------------------------
// CONEXIÓN DE RUTAS
// ----------------------------------------------------

const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const patientRoutes = require('./routes/patientRoutes'); 

app.get('/', (req, res) => {
    res.status(200).send('Servidor Coter Backend funcionando. ¡Conectado!');
});

app.use('/api/auth', authRoutes);
app.use('/api/therapist', therapistRoutes); 
app.use('/api/patient', patientRoutes); 

// ----------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});