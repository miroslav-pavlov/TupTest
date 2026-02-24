// build-content.js
const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");

const menu = fs.readFileSync("./src/menu.js", "utf8");
const content = fs.readFileSync("./src/content.js", "utf8");

const combined = menu + "\n" + content;

const obfuscated = JavaScriptObfuscator.obfuscate(combined, {
    identifierNamesGenerator: "hexadecimal",
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
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.4,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    splitStrings: true,
    splitStringsChunkLength: 5,
    numbersToExpressions: true,
    transformObjectKeys: true,
    sourceMap: false,
    debugProtection: false,
});

fs.writeFileSync("./build/content.js", obfuscated.getObfuscatedCode());
console.log("content.js built successfully");