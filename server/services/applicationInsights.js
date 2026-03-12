const applicationInsights = require('applicationinsights');

let initialized = false;

function setupApplicationInsights() {
  const connectionString = process.env.AZURE_APPINSIGHTS_CONNECTION_STRING;
  if (!connectionString || initialized) return null;

  applicationInsights
    .setup(connectionString)
    .setAutoCollectConsole(true, true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectRequests(true)
    .setUseDiskRetryCaching(true)
    .start();

  initialized = true;
  return applicationInsights.defaultClient;
}

module.exports = {
  setupApplicationInsights,
};
