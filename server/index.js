const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/health');
const runtimeRoutes = require('./routes/runtime');
const { setupApplicationInsights } = require('./services/applicationInsights');

function createApp() {
  setupApplicationInsights();

  const app = express();
  const distPath = path.resolve(__dirname, '..', 'dist');
  const indexPath = path.join(distPath, 'index.html');

  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', apiRoutes);
  app.use('/api/runtime', runtimeRoutes);

  app.use(express.static(distPath));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(indexPath, (error) => {
      if (error) {
        res.status(404).send('Build output not found. Run npm run build before npm start.');
      }
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Logic View Bright listening on port ${port}`);
  });
}

module.exports = {
  createApp,
};
