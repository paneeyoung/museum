import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones/other devices on the LAN load dev JS chunks and HMR when
  // hitting the dev server via its network IP instead of localhost — without
  // this, Next.js silently refuses those requests and the page never
  // hydrates (buttons look clickable but do nothing, no console error).
  allowedDevOrigins: ['192.168.178.147'],
};

export default nextConfig;
