const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : false,
    entry: {
        spoof: "./src/spoof.js",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "build"),
        iife: false,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/styles.css" },
            ],
        }),
    ],
    optimization: {
        minimize: !isDev,
        concatenateModules: false,
    },
};