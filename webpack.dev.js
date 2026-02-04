const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",

  devtool: "inline-source-map",

  devServer: {
    static: {
      directory: path.resolve(__dirname, "src"),
      watch: true,
    },

    watchFiles: {
      paths: ["src/**/*.html"],
    },

    hot: true,
    liveReload: false,
    open: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
