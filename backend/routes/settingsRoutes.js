const express = require('express');
const router = express.Router();
const { getSettings, updateThreshold } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', getSettings);
router.put('/threshold', adminOnly, updateThreshold);

module.exports = router;