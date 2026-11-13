const fs = require("node:fs");
const path = require("node:path");
const withSqliteLocalAndroidProject = require("./plugins/with-sqlite-local-android-project");

const isDevelopmentBuild = process.env.APP_VARIANT === "development";
const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
const certificatePath = path.join(__dirname, "certs", "rootedu-ota-certificate.pem");
const hasUpdateCertificate = fs.existsSync(certificatePath);
const updateUrl = projectId ? `https://u.expo.dev/${projectId}` : undefined;

module.exports = ({ config }) => {
  const appConfig = {
    ...config,
    runtimeVersion: { policy: "appVersion" },
    updates: {
      enabled: Boolean(updateUrl && hasUpdateCertificate),
      ...(updateUrl ? { url: updateUrl } : {}),
      ...(hasUpdateCertificate ? {
        codeSigningCertificate: "./certs/rootedu-ota-certificate.pem",
        codeSigningMetadata: { keyid: "rootedu-main", alg: "rsa-v1_5-sha256" },
      } : {}),
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
  };

  return withSqliteLocalAndroidProject(appConfig);
};
