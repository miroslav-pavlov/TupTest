// ==UserScript==
// @name         TupTest
// @namespace    http://tampermonkey.net/
// @version      1.1
// @updateURL    https://tuptest.xyz/tuptest.user.js
// @downloadURL  https://tuptest.xyz/tuptest.user.js
// @description  znaesh kakvo e tuptest, ne se nujdaesh ot obqsnenie
// @author       decata na bulgarskata durjava
// @match        https://www.smartest.bg/session/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      tuptest.xyz
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";
    // Промени на "false" за да скриеш сивия текст в ъгъла
    const showDebug = true;

    const BUNDLE_ENDPOINT = "https://h.tuptest.xyz/cieddmsuhg";
    // add @connect
    // const BUNDLE_ENDPOINT = "http://127.0.0.1:8000/cieddmsuhg";

    const KEY_VERSION = "tt_version";
    const KEY_SPOOF = "tt_spoof";
    const KEY_CONTENT = "tt_content";
    const KEY_STYLES = "tt_styles";

    function createWatermark() {
        const text = "Built by Acme Corp · v1.0.0";

        const watermark = document.createElement("div");
        watermark.id = "tt-status";
        watermark.textContent = text;
        watermark.style.display = showDebug ? "block" : "none";

        Object.assign(watermark.style, {
            position: "fixed",
            top: "10px",
            right: "12px",
            zIndex: "9999",
            fontSize: "11px",
            lineHeight: "1",
            fontFamily: "system-ui, sans-serif",
            color: "rgba(150, 150, 150, 0.45)",
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "0.02em",
            transition: "opacity 0.3s ease",
        });
        document.addEventListener("DOMContentLoaded", function () {
            document.body.appendChild(watermark);
        });

        if (document.readyState !== "loading") {
            document.body.appendChild(watermark);
        }
        return watermark;
    }

    function editWatermark(watermark, text) {
        watermark.textContent = text;
    }

    function injectSpoof(code) {
        const script = document.createElement("script");
        script.id = "tt-spoof";
        script.textContent = code;
        document.documentElement.prepend(script);
    }

    function injectBundle(content, styles) {
        if (styles) {
            const style = document.createElement("style");
            style.id = "tt-styles";
            style.textContent = styles;
            document.documentElement.appendChild(style);
        }
        if (content) {
            const script = document.createElement("script");
            script.id = "tt-content";
            script.textContent = content;
            document.documentElement.appendChild(script);
        }
    }

    function loadCache() {
        return {
            spoof: GM_getValue(KEY_SPOOF, null),
            content: GM_getValue(KEY_CONTENT, null),
            styles: GM_getValue(KEY_STYLES, null),
            version: GM_getValue(KEY_VERSION, null),
        };
    }

    function saveCache({ version, spoof, content, styles }) {
        GM_setValue(KEY_VERSION, version);
        GM_setValue(KEY_SPOOF, spoof);
        GM_setValue(KEY_CONTENT, content);
        GM_setValue(KEY_STYLES, styles);
    }

    function fetchBundle() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: BUNDLE_ENDPOINT,
                onload(res) {
                    if (res.status !== 200) {
                        reject(new Error(`Server returned ${res.status}`));
                        return;
                    }
                    try {
                        resolve(JSON.parse(res.responseText));
                    } catch (e) {
                        reject(new Error("Failed to parse bundle JSON"));
                    }
                },
                onerror(err) {
                    reject(new Error("Network error: " + JSON.stringify(err)));
                },
            });
        });
    }

    async function main() {
        const cache = loadCache();
        const watermark = createWatermark();

        if (cache.version && cache.spoof && cache.content && cache.styles) {
            injectSpoof(cache.spoof);
            injectBundle(cache.content, cache.styles);
            editWatermark(watermark, `found installed version: ${cache.version}`);

            try {
                editWatermark(watermark, `searching for updates`);
                const bundle = await fetchBundle();
                // let forceVersionRequest = GM_getValue("forceVersionRequest", true);
                // if (bundle.version !== cache.version || forceVersionRequest) {
                    if (bundle.version !== cache.version) {
                    editWatermark(watermark, `new version found: ${bundle.version}`);
                    // GM_setValue("forceVersionRequest", false);
                    saveCache(bundle);
                    window.location.reload();
                } else {
                    editWatermark(watermark, `running latest version: ${cache.version}`);
                    // GM_setValue("forceVersionRequest", true);
                }
            } catch (err) {
                editWatermark(watermark, `error connecting to server`);
                console.error(err.message);
            }
        } else {
            try {
                editWatermark(watermark, `downloading tuptest`);
                const bundle = await fetchBundle();
                saveCache(bundle);
                injectSpoof(bundle.spoof);
                injectBundle(bundle.content, bundle.styles);
                window.location.reload();
            } catch (err) {
                editWatermark(watermark, `error connecting to server`);
                console.error("Error! ", err.message);
            }
        }
    }

    main();
})();
