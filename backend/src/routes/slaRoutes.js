const express = require('express');
const router = express.Router();
const { getSlaConfigs, updateSlaConfig } = require('../controllers/slaController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('ADMIN'));

router.get('/', getSlaConfigs);
router.put('/:priority', updateSlaConfig);

module.exports = router;
