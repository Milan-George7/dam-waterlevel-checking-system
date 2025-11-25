const express = require('express');
const router = express.Router();
const {
  getWaterLevels,
  addWaterLevel,
  updateWaterLevel,
  deleteWaterLevel,
  getAlerts
} = require('../controllers/waterLevelController');
const { protect, operatorOrAdmin } = require('../middleware/auth');

router.use(protect);

router.get('/alerts', getAlerts);

router.route('/')
  .get(getWaterLevels)
  .post(operatorOrAdmin, addWaterLevel);

router.route('/:id')
  .put(operatorOrAdmin, updateWaterLevel)
  .delete(operatorOrAdmin, deleteWaterLevel);

module.exports = router;