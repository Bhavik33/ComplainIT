const express = require('express');
const router = express.Router({ mergeParams: true });
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getComments)
  .post(addComment);

module.exports = router;
