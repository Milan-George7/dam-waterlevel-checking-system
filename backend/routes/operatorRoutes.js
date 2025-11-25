const express = require('express');
const router = express.Router();
const {
  getOperators,
  addOperator,
  updateOperator,
  deleteOperator
} = require('../controllers/operatorController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getOperators)
  .post(addOperator);

router.route('/:id')
  .put(updateOperator)
  .delete(deleteOperator);

module.exports = router;