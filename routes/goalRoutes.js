// routes/goalRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const goalController = require('../controllers/goalController'); // ¡Asegúrate de que este archivo existe!

// Todas las rutas son protegidas con authMiddleware
router.use(authMiddleware); 

// Rutas de Metas
router.get('/:patientId', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:goalId', goalController.updateGoal);
router.delete('/:goalId', goalController.deleteGoal);

module.exports = router;