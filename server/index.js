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

const resolveBasePath = (appUrl) => {
  if (!appUrl) {
    return '/';
  }

  let basePath = appUrl;
  try {
    basePath = new URL(appUrl).pathname;
  } catch {
    basePath = appUrl;
  }

  if (!basePath.startsWith('/')) {
    basePath = `/${basePath}`;
  }

  // Express routing should not include a trailing slash for non-root base paths.
  if (basePath.length > 1 && basePath.endsWith('/')) {
    basePath = basePath.slice(0, -1);
  }

  return basePath || '/';
};

function createApp() {
  setupApplicationInsights();

  const app = express();
  const distPath = path.resolve(__dirname, '..', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  const basePath = resolveBasePath(process.env.VITE_APP_URL);

  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(globalRateLimit);
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Register /api/runtime before /api so runtime routes are not shadowed
  app.use('/api/runtime', runtimeRoutes);
  app.use('/api', apiRoutes);

  const staticAssets = express.static(distPath, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    },
  });

  app.use(staticAssets);
  if (basePath !== '/') {
    app.use(basePath, staticAssets);
  }
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
