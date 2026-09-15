/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Node URIs are https://atlasalt.com/q/<uuid>; their pages live in Open Atlas.
  async redirects() {
    return [{ source: "/q/:id", destination: "/open/q/:id", permanent: true }];
  },
};

export default nextConfig;
