/** @type {import('next').NextConfig} */
const nextConfig = {};

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
