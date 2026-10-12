const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  updateWorkerProfile,
  getWorkerAvailability,
} = require('../controllers/workerController');
const { requireAuth, requireWorker } = require('../middleware/authMiddleware');

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.get('/:id/availability', getWorkerAvailability);
router.put('/profile', requireAuth, requireWorker, updateWorkerProfile);

module.exports = router;
