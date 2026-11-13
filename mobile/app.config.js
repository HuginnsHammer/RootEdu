const isDevelopmentBuild = process.env.APP_VARIANT === "development";
const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
const updateUrl = projectId ? `https://u.expo.dev/${projectId}` : undefined;

module.exports = ({ config }) => ({
  ...config,
  runtimeVersion: { policy: "appVersion" },
  updates: {
    enabled: Boolean(updateUrl),
    ...(updateUrl ? { url: updateUrl } : {}),
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
    maxUpdatesToKeep: 3,
  },
  extra: {
    ...config.extra,
    eas: projectId ? { projectId } : config.extra?.eas,
  },
  android: {
    ...config.android,
    // Permit HTTP only in explicitly marked local development builds.
    // Production builds keep Android's cleartext-traffic protection.
    usesCleartextTraffic: isDevelopmentBuild,
  },
});
