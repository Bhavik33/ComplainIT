const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @desc Health check overview
// @route GET /health
router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';

  return res.status(200).json({
    status: 'UP',
    system: 'ResolveIT Complaint Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus
    }
  });
});

// @desc Liveness Probe (Kubernetes / Docker)
// @route GET /health/live
router.get('/live', (req, res) => {
  return res.status(200).json({ status: 'ALIVE' });
});

// @desc Readiness Probe (Kubernetes / Docker)
// @route GET /health/ready
router.get('/ready', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return res.status(200).json({ status: 'READY', db: 'CONNECTED' });
  } else {
    return res.status(503).json({ status: 'NOT_READY', db: 'DISCONNECTED' });
  }
});

module.exports = router;
