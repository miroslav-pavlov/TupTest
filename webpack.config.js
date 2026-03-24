const path = require("path");
const JavaScriptObfuscator = require("webpack-obfuscator");
const CopyPlugin = require("copy-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : false,
    entry: {
        // inject: "./src/inject.js",
        popup: "./src/popup.js",
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
                { from: "src/manifest(for_build).json", to: "manifest.json" },
                { from: "src/popup.html" },
                { from: "src/styles.css" },
                { from: "src/icons", to: "icons" },
            ],
        }),
        ...(!isDev ? [
            new JavaScriptObfuscator({
                // Rename variables to gibberish
                identifierNamesGenerator: "hexadecimal",

                // Break up string literals
                stringArray: true,
                stringArrayEncoding: ["base64"],
                stringArrayThreshold: 0.85,
                stringArrayCallsTransform: true,
                stringArrayCallsTransformThreshold: 0.75,
                stringArrayIndexShift: true,
                stringArrayRotate: true,
                stringArrayShuffle: true,
                stringArrayWrappersCount: 3,
                stringArrayWrappersType: "function",

                // Control flow flattening makes logic much harder to follow
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 0.4,

                // Insert dead code
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.2,

                // Misc
                splitStrings: true,
                splitStringsChunkLength: 5,
                numbersToExpressions: true,
                transformObjectKeys: true,

                sourceMap: false,
                debugProtection: false,
            }),
        ] : []),
    ],
    optimization: {
        minimize: false,
        concatenateModules: false,
    },
};