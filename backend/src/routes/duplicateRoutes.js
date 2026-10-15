const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getSimilarComplaints,
  linkToMaster,
  unlinkFromMaster,
  getLinkedDuplicates,
  scanAndStoreSimilar
} = require('../controllers/duplicateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/similar', getSimilarComplaints);
router.get('/linked-duplicates', getLinkedDuplicates);
router.post('/scan-duplicates', authorize('ADMIN', 'STAFF'), scanAndStoreSimilar);
router.put('/link-master', authorize('ADMIN'), linkToMaster);
router.put('/unlink-master', authorize('ADMIN'), unlinkFromMaster);

module.exports = router;
