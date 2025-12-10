// routes/patientRoutes.js (FINAL)

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/auth'); 

router.use(protect, restrictTo('PATIENT'));

// 1. Crear un nuevo Check-in
router.post('/checkin', patientController.createCheckin); 

// 2. Obtener todas las metas asignadas al paciente
router.get('/goals', patientController.getAssignedGoals); 

// 3. Obtener historial de Check-ins (para el gráfico)
router.get('/checkins', patientController.getHistoricalCheckins); 

module.exports = router;