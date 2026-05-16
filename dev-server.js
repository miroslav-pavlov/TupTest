const http = require("http");
const fs = require("fs");

const bundle = {
    version: "dev",
    spoof: fs.readFileSync("./build/spoof.js", "utf8"),
    content: fs.readFileSync("./build/tuptest.js", "utf8"),
    styles: fs.readFileSync("./build/styles.css", "utf8"),
};

http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(bundle));
}).listen(42424, () => console.log("Dev server running on http://localhost:42424/bundle"));