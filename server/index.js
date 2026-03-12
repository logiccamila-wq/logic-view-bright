const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/health');
const runtimeRoutes = require('./routes/runtime');
const { setupApplicationInsights } = require('./services/applicationInsights');
const { closePool } = require('../api/shared/db');

const NON_API_ROUTE_PATTERN = /^(?!\/api(?:\/|$)).*/;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const globalRateLimit = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
const staticFileRateLimit = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

function createApp() {
  setupApplicationInsights();

  const app = express();
  const distPath = path.resolve(__dirname, '..', 'dist');
  const indexPath = path.join(distPath, 'index.html');

  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(globalRateLimit);
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', apiRoutes);
  app.use('/api/runtime', runtimeRoutes);

  app.use(express.static(distPath));
  app.get(NON_API_ROUTE_PATTERN, staticFileRateLimit, (_req, res) => {
    res.sendFile(indexPath, (error) => {
      if (error) {
        const status = error.code === 'ENOENT' ? 404 : 500;
        const message =
          status === 404
            ? 'Build output not found. Run npm run build before npm start.'
            : 'Unable to serve the frontend build output.';
        res.status(status).send(message);
      }
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`Logic View Bright listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(() => {
      closePool().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = {
  createApp,
};
