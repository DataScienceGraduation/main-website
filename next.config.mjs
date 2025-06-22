/** @type {import('next').NextConfig} */
const nextConfig = {
  // The following line is causing issues with dynamic pages.
  // By removing it, Next.js will use its standard server-based mode,
  // which is required for our dynamic report page.
  // output: 'export',
};

nextConfig.images = {
  unoptimized: true,
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
