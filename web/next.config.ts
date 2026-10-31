import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Certification uploads (max 4 MB, config/accounts.ts) go through a
    // server action; the default limit is 1 MB.
    serverActions: {bodySizeLimit: '5mb'},
  },
};

export default nextConfig;
