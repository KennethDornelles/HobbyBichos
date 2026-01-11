module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Se você usar Reanimated, adicione isso:
      // "react-native-reanimated/plugin",
    ],
  };
};