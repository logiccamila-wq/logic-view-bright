const { Router } = require('express');
const runtimeHandler = require('../../api/runtime');

const router = Router();

router.use(async (req, res) => {
  const context = {
    log: {
      error: (...args) => console.error(...args),
      warn: (...args) => console.warn(...args),
      info: (...args) => console.info(...args),
    },
  };

  const azureRequest = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    params: {
      segments: req.path.replace(/^\/+/, ''),
    },
  };

  const response = await runtimeHandler(context, azureRequest);

  if (response?.headers) {
    for (const [name, value] of Object.entries(response.headers)) {
      res.setHeader(name, value);
    }
  }

  res.status(response?.status || 200).send(response?.body || '');
});

module.exports = router;
