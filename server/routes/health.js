const { Router } = require('express');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'logic-view-bright', runtime: 'azure-app-service' });
});

module.exports = router;
