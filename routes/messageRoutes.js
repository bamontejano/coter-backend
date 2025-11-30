// routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

router.use(authMiddleware);

// Rutas de Mensajes
router.get('/:patientId', messageController.getMessages);
router.post('/', messageController.sendMessage);

module.exports = router;