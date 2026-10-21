let config;

try {
  const { getDefaultConfig } = require('expo/metro-config');
  config = getDefaultConfig(__dirname);
} catch {
  const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
  config = mergeConfig(getDefaultConfig(__dirname), {});
}

module.exports = config;
