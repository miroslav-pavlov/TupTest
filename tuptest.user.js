// ==UserScript==
// @name         TupTest
// @namespace    http://tampermonkey.net/
// @version      1.1
// @updateURL    https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey_userscript/tuptest.user.js
// @downloadURL  https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey_userscript/tuptest.user.js
// @description  tuptest ne se nujdae ot obqsnenie
// @author       decata na bulgarskata durjava
// @match        https://www.smartest.bg/session/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.github.com
// @connect      objects.githubusercontent.com
// @connect      release-assets.githubusercontent.com
// @connect      github.com
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";
    // Промени на "false" за да скриеш сивия текст в ъгъла
    const showDebug = true;
    const isDev = false;

    const DEV_ENDPOINT = "http://localhost:42424/bundle";

    const KEY_VERSION = "tt_version";
    const KEY_SPOOF = "tt_spoof";
    const KEY_CONTENT = "tt_content";
    const KEY_STYLES = "tt_styles";

    function gmFetch(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url,
                onload(res) {
                    if (res.status !== 200) {
                        reject(new Error(`Server returned ${res.status} for ${url}`));
                        return;
                    }
                    resolve(res.responseText);
                },
                onerror(err) {
                    reject(new Error("Network error: " + JSON.stringify(err)));
                },
            });
        });
    }

    async function fetchBundle() {
        if (isDev) {
            const text = await gmFetch(DEV_ENDPOINT);
            return JSON.parse(text);
        }

        const releaseText = await gmFetch(`https://api.github.com/repos/miroslav-pavlov/TupTest/releases`);
        const releases = JSON.parse(releaseText);
        if (!Array.isArray(releases)) throw new Error("Unexpected response from GitHub");
        const release = releases.find(r => r.tag_name.startsWith("script-"));
        if (!release) throw new Error("No script releases found");
        const version = release.tag_name;

        function assetUrl(name) {
            const asset = release.assets.find((a) => a.name === name);
            if (!asset) throw new Error(`Asset "${name}" not found in release ${version}`);
            return asset.browser_download_url;
        }

        const [spoof, content, styles] = await Promise.all([
            gmFetch(assetUrl("spoof.js")),
            gmFetch(assetUrl("tuptest.js")),
            gmFetch(assetUrl("styles.css")),
        ]);

        return { version, spoof, content, styles };
    }

    function createWatermark() {
        const watermark = document.createElement("div");
        watermark.id = "tt-status";
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

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => document.body.appendChild(watermark));
        } else {
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

    async function main() {
        const watermark = createWatermark();

        if (isDev) {
            editWatermark(watermark, "dev mode: fetching from localhost");
            try {
                const bundle = await fetchBundle();
                injectSpoof(bundle.spoof);
                injectBundle(bundle.content, bundle.styles);
                editWatermark(watermark, "dev mode: loaded from localhost");
            } catch (err) {
                editWatermark(watermark, "dev mode: error connecting to localhost");
                console.error(err.message);
            }
            return;
        }

        const cache = loadCache();

        if (cache.version && cache.spoof && cache.content && cache.styles) {
            injectSpoof(cache.spoof);
            injectBundle(cache.content, cache.styles);
            editWatermark(watermark, `found installed version: ${cache.version}`);

            try {
                editWatermark(watermark, "searching for updates");
                const bundle = await fetchBundle();
                if (bundle.version !== cache.version) {
                    editWatermark(watermark, `new version found: ${bundle.version}`);
                    saveCache(bundle);
                    window.location.reload();
                } else {
                    editWatermark(watermark, `running latest version: ${cache.version}`);
                }
            } catch (err) {
                editWatermark(watermark, "error connecting to server");
                console.error(err.message);
            }
        } else {
            try {
                editWatermark(watermark, "downloading tuptest");
                const bundle = await fetchBundle();
                saveCache(bundle);
                injectSpoof(bundle.spoof);
                injectBundle(bundle.content, bundle.styles);
                window.location.reload();
            } catch (err) {
                editWatermark(watermark, "error connecting to server");
                console.error("Error! ", err.message);
            }
        }
    }

    main();
})();
