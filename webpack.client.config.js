const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack"); // Make sure to require webpack at the top

module.exports = {
  mode: "development", // Change to 'production' when ready for production
  target: "web", // Webpack should compile for browser environments
  entry: {
    styles: [
      "toastify-js/src/toastify.css",
      "./app/client/public/assets/css/styles.js",
    ], // Assuming styles.js imports all necessary CSS
    vendor: ["jquery", "hammerjs", "micromodal", "toastify-js","pixi.js"],
    app: [
      "./app/client/public/assets/js/jquery.lazy.min.js",
      "./app/client/public/assets/js/jquery.hammer.js",
      "./app/client/public/assets/js/fontawesome.min.js",
      "./app/client/public/assets/js/addon.js",
    ],
  },
  output: {
    path: path.resolve(__dirname, "./dist/client/public/assets"),
    filename: "./js/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      // Add rules for images and other assets here if needed
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/main.app.css", // Output CSS to the css folder
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "./app/client/public",
          to: path.resolve(__dirname, "./dist/client/public"),
        },
        {
          from: "./app/client/views",
          to: path.resolve(__dirname, "./dist/client/views"),
        },
        // You may need to adjust these patterns based on your public folder structure
      ],
    }),
    new CompressionPlugin({
      // This plugin will gzip your output files
      algorithm: "gzip",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "window.$": "jquery",
    }),
    // Add other plugins if necessary
  ],
  resolve: {
    extensions: [".js"], // Add '.ts' if you have TypeScript client files
  },
  // Add other configurations if necessary
};
