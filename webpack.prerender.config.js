const path = require("path");
const webpackConfig = require("./webpack.system-addon.config");
const webpack = require("webpack");

const srcPath = "content-src/activity-stream-prerender.jsx";

const banner = `
NOTE: This file is generated by webpack from ${srcPath}
using the buildmc:html npm task.
`;

module.exports = Object.assign({}, webpackConfig, {
  mode: "none",
  target: "node",
  devtool: "sourcemap",
  entry: path.join(__dirname, srcPath),
  output: {
    path: path.join(__dirname, "bin"),
    filename: "prerender.js",
    libraryTarget: "commonjs2"
  },
  externals: {
    "prop-types": "commonjs prop-types",
    "react": "commonjs react",
    "react-dom": "commonjs react-dom"
  },
  plugins: [
    new webpack.BannerPlugin(banner),
    // fluent-react is expecting a browser environment and `document` is not
    // available in our prerendering step.
    // https://github.com/projectfluent/fluent.js/blob/2f10bdef682b6e9dad482d96ebaaeec9f7631bb9/fluent-react/src/markup.js#L3
    new webpack.DefinePlugin({document: {createElement: () => {}}})
  ]
});
