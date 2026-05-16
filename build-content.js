const fs = require("fs");

const utils = fs.readFileSync("./src/utils.js", "utf8");
const config = fs.readFileSync("./src/config.js", "utf8");
const ui = fs.readFileSync("./src/ui.js", "utf8");
const menu = fs.readFileSync("./src/menu.js", "utf8");
const content = fs.readFileSync("./src/content.js", "utf8");

const combined = `${utils}\n${config}\n${ui}\n${menu}\n${content}`;

fs.writeFileSync("./build/tuptest.js", combined);
console.log("tuptest.js built successfully");