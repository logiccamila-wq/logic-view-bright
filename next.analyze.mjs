import analyzer from '@next/bundle-analyzer';
import nextConfig from './next.config.mjs';

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
export default withBundleAnalyzer(nextConfig);