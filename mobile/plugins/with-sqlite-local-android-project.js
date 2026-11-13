const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Expo SDK 54's expo-sqlite publication metadata is currently misread by
 * Gradle autolinking in CI (Publication.version is omitted). Setting this
 * optional property to an empty value makes expo-sqlite use its normal local
 * Android project instead of the publication-script path.
 *
 * The value is intentionally empty: it adds no SQLite compiler flags and
 * leaves the module's default FTS/build configuration unchanged.
 */
module.exports = function withSqliteLocalAndroidProject(config) {
  return withGradleProperties(config, (modConfig) => {
    const key = "expo.sqlite.customBuildFlags";
    const existing = modConfig.modResults.find(
      (entry) => entry.type === "property" && entry.key === key,
    );

    if (existing) {
      existing.value = "";
    } else {
      modConfig.modResults.push({
        type: "property",
        key,
        value: "",
      });
    }

    return modConfig;
  });
};
