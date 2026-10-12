const express = require('express');
const router = express.Router();
const {
  createReview,
  getWorkerReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { requireAuth, requireCustomer, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', requireAuth, requireCustomer, createReview);
router.get('/worker/:workerId', getWorkerReviews);
router.delete('/:id', requireAuth, requireAdmin, deleteReview);

module.exports = router;
