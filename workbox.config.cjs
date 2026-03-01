module.exports = {
  swSrc: 'public/sw.workbox.js',
  swDest: 'public/sw.js',
  globDirectory: '.',
  globPatterns: [
    'public/**/*.{html,svg,png,js,css,json}',
    '.next/static/**/*.{js,css,woff2}'
  ],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};