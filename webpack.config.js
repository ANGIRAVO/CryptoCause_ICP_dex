const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

let localCanisters, prodCanisters, canisters;

function initCanisterIds() {
  try {
    localCanisters = require(path.resolve(".dfx", "local", "canister_ids.json"));
  } catch (error) {
    console.log("No local canister_ids.json found. Continuing...");
  }
  try {
    prodCanisters = require(path.resolve("canister_ids.json"));
  } catch (error) {
    console.log("No production canister_ids.json found. Continuing...");
  }

  const network = process.env.DFX_NETWORK || "local";
  canisters = network === "local" ? localCanisters : prodCanisters;

  if (!canisters) {
    canisters = {};
  }
}

initCanisterIds();

const isDevelopment = process.env.NODE_ENV !== "production";

const frontendDirectory = "src/charity_frontend";

const frontend_entry = path.join(__dirname, frontendDirectory, "src", "index.tsx");

module.exports = {
  target: "web",
  mode: isDevelopment ? "development" : "production",
  entry: {
    index: frontend_entry,
  },
  devtool: isDevelopment ? "source-map" : false,
  optimization: {
    minimize: !isDevelopment,
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    fallback: {
      assert: require.resolve("assert/"),
      buffer: require.resolve("buffer/"),
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify/"),
      util: require.resolve("util/"),
    },
  },
  output: {
    filename: "index.js",
    path: path.join(__dirname, "src/charity_frontend/dist"),
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, frontendDirectory, "public", "index.html"),
      cache: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, frontendDirectory, "public", ".ic-assets.json*"),
          to: ".ic-assets.json",
          noErrorOnMissing: true
        },
      ],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      DFX_NETWORK: "local",
      ...Object.fromEntries(
        Object.entries(canisters).map(([name, canister]) => [
          `CANISTER_ID_${name.toUpperCase()}`,
          canister[process.env.DFX_NETWORK || "local"],
        ])
      ),
    }),
    new webpack.ProvidePlugin({
      Buffer: [require.resolve("buffer/"), "Buffer"],
      process: require.resolve("process/browser"),
    }),
  ],
  devServer: {
    proxy: [
      {
        context: ["/api"],
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" },
      }
    ],
    static: path.resolve(__dirname, frontendDirectory, "public"),
    hot: true,
    watchFiles: [path.resolve(__dirname, frontendDirectory, "public")],
    liveReload: true,
  },
};
