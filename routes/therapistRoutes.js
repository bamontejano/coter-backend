// routes/therapistRoutes.js

const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { protect, restrictTo } = require('../middleware/auth'); // Importación corregida

router.use(protect, restrictTo('THERAPIST'));

router.get('/patients', therapistController.getPatients); 
router.patch('/assign', therapistController.assignPatient);
router.get('/patient/:patientId', therapistController.getPatientProfile); 
router.post('/goals', therapistController.createGoal); 
router.get('/goals/:patientId', therapistController.getPatientGoals);

module.exports = router;