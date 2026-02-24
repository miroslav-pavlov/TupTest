const path = require("path");
const JavaScriptObfuscator = require("webpack-obfuscator");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: false,
    entry: {
        inject: "./src/inject.js",
        popup: "./src/popup.js",
        spoof: "./src/spoof.js",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        iife: false,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/manifest.dist.json", to: "manifest.json" },
                { from: "src/popup.html" },
                { from: "src/styles.css" },
                { from: "src/icons", to: "icons" },
            ],
        }),
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
            controlFlowFlatteningThreshold: 0.4, // Higher = slower but more obfuscated

            // Insert dead code
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.2,

            // Misc
            splitStrings: true,
            splitStringsChunkLength: 5,
            numbersToExpressions: true,
            transformObjectKeys: true,

            // Disable source maps in production!
            sourceMap: false,
            debugProtection: false, // Set true to break devtools (aggressive)
        }),
    ],
    // Don't bundle — keep files separate (required for extensions)
    optimization: {
        minimize: false, // Obfuscator handles this
        concatenateModules: false,
    },
};
