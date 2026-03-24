const basePath = process.env.DEPLOY_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath
      }
    : {}),
  env: {
    NEXT_PUBLIC_AUTH_DISABLED: "false",
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};

module.exports = nextConfig;
