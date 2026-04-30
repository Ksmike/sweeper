import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // Set basePath to your GitHub repo name for GitHub Pages.
  // Change "sweeper" to match your actual repo name if different.
  basePath: isProd ? "/sweeper" : "",
};

export default nextConfig;
