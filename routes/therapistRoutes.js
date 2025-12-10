// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { protect, restrictTo } = require('../middleware/auth'); 

// Aplica el middleware de autenticación y restricción de rol a todas las rutas
router.use(protect, restrictTo('THERAPIST'));

// RUTAS
router.get('/patients', therapistController.getPatients); // LÍNEA 12

router.post('/assign', therapistController.assignPatient);

router.get('/patient/:patientId', therapistController.getPatientProfile); 

router.post('/goals', therapistController.createGoal); 

router.get('/goals/:patientId', therapistController.getPatientGoals); 

router.patch('/goals/:goalId', therapistController.updateGoal);

module.exports = router;