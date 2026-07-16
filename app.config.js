const BUILD_PROPERTIES_PLUGIN = "expo-build-properties";

/**
 * Mantém a otimização Android restrita ao perfil de produção do EAS.
 * O sinalizador é definido em eas.json e avaliado durante a resolução
 * da configuração dinâmica do Expo.
 */
module.exports = ({ config }) => {
  const enableAndroidReleaseOptimization =
    process.env.ENABLE_ANDROID_RELEASE_OPTIMIZATION === "true";

  const plugins = (config.plugins ?? []).filter((plugin) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    return pluginName !== BUILD_PROPERTIES_PLUGIN;
  });

  if (enableAndroidReleaseOptimization) {
    plugins.push([
      BUILD_PROPERTIES_PLUGIN,
      {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ]);
  }

  return {
    ...config,
    plugins,
  };
};
