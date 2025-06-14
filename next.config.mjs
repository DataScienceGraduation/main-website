/** @type {import('next').NextConfig} */
const nextConfig = {};
nextConfig.output = 'export';

nextConfig.images = {
  dangerouslyAllowSVG: true,
  remotePatterns: [
    {
      protocol: "https",
      hostname: "placehold.co",
      port: "",
      pathname: "/*",
    },
  ],
};

export default nextConfig;
