// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
// Asumo que tu middleware está bien configurado para exportar protect y restrictTo
const { protect, restrictTo } = require('../middleware/auth'); 

// Aplica el middleware de autenticación y restricción de rol a todas las rutas
router.use(protect, restrictTo('THERAPIST'));

// RUTAS EXISTENTES
router.get('/patients', therapistController.getPatients); 
router.patch('/assign', therapistController.assignPatient);
router.get('/patient/:patientId', therapistController.getPatientProfile); 
router.post('/goals', therapistController.createGoal); 
router.get('/goals/:patientId', therapistController.getPatientGoals);

// 🚨 RUTA FALTANTE (ACTUALIZACIÓN DE METAS)
router.patch('/goals/:goalId', therapistController.updateGoal);

module.exports = router;