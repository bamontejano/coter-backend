// routes/assignmentRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const assignmentController = require('../controllers/assignmentController');

router.use(authMiddleware);

// Rutas de Asignaciones
router.get('/:patientId', assignmentController.getAssignments);
router.post('/', assignmentController.createAssignment);
router.put('/:assignmentId', assignmentController.updateAssignment);
router.delete('/:assignmentId', assignmentController.deleteAssignment);

module.exports = router;