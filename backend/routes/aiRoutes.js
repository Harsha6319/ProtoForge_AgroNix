const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/chat
router.post('/chat', aiController.chat);

// POST /api/ai/train
router.post('/train', aiController.trainData);

module.exports = router;
