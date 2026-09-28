const app = require('./app');
const config = require('./config');
const { connectDb } = require('./config/db');

function assertSafeConfig() {
  const weakSecrets = new Set([
    'dev-secret-change-me',
    'change-me-to-a-long-random-secret',
    'regive-dev-secret-change-in-production',
  ]);

  if (config.nodeEnv === 'production' && weakSecrets.has(config.jwtSecret)) {
    throw new Error('Refusing to start: set a strong JWT_SECRET in production');
  }

  if (weakSecrets.has(config.jwtSecret)) {
    console.warn('[security] JWT_SECRET is a default/dev value. Change it before production.');
  }
}

async function start() {
  try {
    assertSafeConfig();
    await connectDb();
    app.listen(config.port, () => {
      console.log(`ReGive backend v${require('../package.json').version} on http://localhost:${config.port}`);
      console.log(`Phase: final-release | env=${config.nodeEnv} | ai=${config.aiProvider}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
