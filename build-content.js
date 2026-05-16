const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development";

const menu = fs.readFileSync("./src/menu.js", "utf8");
const content = fs.readFileSync("./src/content.js", "utf8");
const auth = fs.readFileSync("./src/auth.js", "utf8");
const config = fs.readFileSync("./src/config.js", "utf8");
const ui = fs.readFileSync("./src/ui.js", "utf8");
const utils = fs.readFileSync("./src/utils.js", "utf8");
const credentials = fs.readFileSync("./src/credentials.js", "utf8");

    const combined = `${utils}\n${auth}\n${config}\n${credentials}\n${ui}\n${menu}\n${content}`;

if (isDev) {
    // fs.writeFileSync("./build/content.js", combined);
    fs.writeFileSync("C:/Users/mirko/Projects/TupTest/TupTestServer/modmenu/content.js", combined);
    console.log("content.js built successfully (dev, unobfuscated)");
} else {
    const obfuscated = JavaScriptObfuscator.obfuscate(combined, {
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
    });

    // fs.writeFileSync("./build/content.js", obfuscated.getObfuscatedCode());
    fs.writeFileSync("C:/Users/mirko/Projects/TupTest/TupTestServer/modmenu/content.js", obfuscated.getObfuscatedCode());

    console.log("content.js built successfully");
}
