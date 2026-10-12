const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', requireAuth, requireAdmin, createService);
router.put('/:id', requireAuth, requireAdmin, updateService);
router.delete('/:id', requireAuth, requireAdmin, deleteService);

module.exports = router;
