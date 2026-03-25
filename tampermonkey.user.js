// ==UserScript==
// @name         TupTest
// @namespace    http://tampermonkey.net/
// @version      2026-03-25
// @description  Mnogo opasen virus!
// @author       decata na bulgarskata durjava
// @match        https://www.smartest.bg/session/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      127.0.0.1
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    // const BUNDLE_ENDPOINT = "https://h.tuptest.xyz/cieddmsuhg";
    const BUNDLE_ENDPOINT = "http://127.0.0.1:8000/cieddmsuhg";

    const KEY_VERSION = "tt_version";
    const KEY_SPOOF = "tt_spoof";
    const KEY_CONTENT = "tt_content";
    const KEY_STYLES = "tt_styles";

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

        if (cache.version && cache.spoof && cache.content && cache.styles) {
            injectSpoof(cache.spoof);
            injectBundle(cache.content, cache.styles);

            try {
                const bundle = await fetchBundle();
                let forceVersionRequest = GM_getValue("forceVersionRequest", true);
                if (bundle.version !== cache.version || forceVersionRequest) {
                    GM_setValue("forceVersionRequest", false);
                    saveCache(bundle);
                    window.location.reload();
                } else {
                    GM_setValue("forceVersionRequest", true);
                }
            } catch (err) {
                console.error(err.message);
            }
        } else {
            try {
                const bundle = await fetchBundle();
                saveCache(bundle);
                injectSpoof(bundle.spoof);
                injectBundle(bundle.content, bundle.styles);
            } catch (err) {
                console.error("Error! ", err.message);
            }
        }
    }

    main();
})();
