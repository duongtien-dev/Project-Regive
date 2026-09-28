const mongoose = require('mongoose');
const config = require('../config');

const MODULES = [
  'auth',
  'campaigns',
  'donations',
  'volunteers',
  'support-requests',
  'notifications',
  'products',
  'inventory',
  'orders',
  'payments',
  'reports',
  'ai',
];

function health(_req, res) {
  res.json({
    success: true,
    message: 'ReGive API is running',
    data: {
      service: 'regive-backend',
      version: require('../../package.json').version,
      phase: 'final-release',
      sprint: 3,
      stack: 'Node.js + Express + MongoDB',
      aiProvider: config.aiProvider || 'mock',
      env: config.nodeEnv,
      modules: MODULES,
    },
  });
}

function ready(_req, res) {
  const state = mongoose.connection.readyState;
  // 1 = connected
  const ok = state === 1;
  res.status(ok ? 200 : 503).json({
    success: ok,
    message: ok ? 'Ready' : 'Not ready',
    data: {
      mongoReadyState: state,
      mongoStatus: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown',
    },
  });
}

module.exports = { health, ready };
