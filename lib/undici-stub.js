// Stub for undici module (browser build)
// This file is used to prevent undici from being bundled in client builds
// undici is a Node.js HTTP client that doesn't work in browsers

module.exports = {};
module.exports.fetch = globalThis.fetch;
module.exports.Request = globalThis.Request;
module.exports.Response = globalThis.Response;
module.exports.Headers = globalThis.Headers;
module.exports.FormData = globalThis.FormData;
