const basePath = process.env.DEPLOY_BASE_PATH || "";
const dashboardPassword = process.env.DASHBOARD_PASSWORD || "";

const buildPasswordHash = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const dashboardPasswordHash = dashboardPassword ? buildPasswordHash(dashboardPassword) : "";

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
    NEXT_PUBLIC_AUTH_DISABLED: dashboardPasswordHash ? "false" : "true",
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DASHBOARD_PASSWORD_HASH: dashboardPasswordHash
  }
};

module.exports = nextConfig;
