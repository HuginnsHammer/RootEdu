const isDevelopmentBuild = process.env.APP_VARIANT === "development";

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    // Permit HTTP only in explicitly marked local development builds.
    // Production builds keep Android's cleartext-traffic protection.
    usesCleartextTraffic: isDevelopmentBuild,
  },
});
