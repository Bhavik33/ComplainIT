const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignStaff,
  updatePriority,
  addInternalNote,
  rateComplaint,
  exportCsv
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/export/csv', authorize('ADMIN'), exportCsv);

router.route('/')
  .post(upload.array('attachments', 5), createComplaint)
  .get(getComplaints);

router.get('/:id', getComplaintById);
router.put('/:id/status', updateStatus);
router.put('/:id/assign', authorize('ADMIN'), assignStaff);
router.put('/:id/priority', authorize('ADMIN'), updatePriority);
router.post('/:id/internal-notes', authorize('STAFF', 'ADMIN'), addInternalNote);
router.post('/:id/rate', authorize('USER'), rateComplaint);

module.exports = router;
