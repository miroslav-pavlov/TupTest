// auth.js
// moved to config.js
// const SERVER = "https://h.tuptest.xyz";

const SS_KEY = "tt_token";
const SS_STAGE_KEY = "tt_stage";

let sessionToken = null;
let sessionPayload = null;
let restoredNameFromStorage = false;

function parsePayload(token) {
    try {
        const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(b64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join(""),
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function storeSession(token) {
    sessionToken = token;
    sessionPayload = parsePayload(token);
    try {
        sessionStorage.setItem(SS_KEY, token);
    } catch {}
}

function clearSession() {
    sessionToken = null;
    sessionPayload = null;
    try {
        sessionStorage.removeItem(SS_KEY);
    } catch {}
}

function isTokenValid() {
    if (!sessionToken || !sessionPayload) return false;
    return sessionPayload.exp && sessionPayload.exp > Math.floor(Date.now() / 1000);
}

// TODO: If site URL changes to another test then clear session so user can't reuse sessions
// ── Restore session from sessionStorage on script load ────────────────────
// Runs once when the content script is injected (i.e. on every page load/
// refresh). If a valid token is found the stage will be restored below.
(function restoreSession() {
    try {
        const saved = sessionStorage.getItem(SS_KEY);
        if (!saved) return;
        const payload = parsePayload(saved);
        if (!payload) {
            sessionStorage.removeItem(SS_KEY);
            return;
        }
        const now = Math.floor(Date.now() / 1000);
        if (!payload.exp || payload.exp <= now) {
            sessionStorage.removeItem(SS_KEY);
            return;
        }
        sessionToken = saved;
        sessionPayload = payload;
    } catch {}
})();

async function fetchAndStoreConfig(sessionToken) {
    try {
        const cfgRes = await fetch(`${SERVER}/i5agf9xeqa`, {
            headers: { Authorization: "Bearer " + sessionToken },
        });
        if (cfgRes.ok) {
            const cfg = await cfgRes.json();
            if (Array.isArray(cfg.blocked_events)) {
                window.blockedEvents = cfg.blocked_events;
            }
        }
    } catch {}
}

function namesMatch(userName) {
    // Also turns cyrillic into latin
    function normalizeName(str) {
        return (str || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z\s]/g, "")
            .replace(/\s+/g, " ");
    }

    const payload = sessionPayload;
    if (!payload) return false;

    const normalizedUserName = normalizeName(userName);
    if (!normalizedUserName) return false;

    const userParts = normalizedUserName.split(" ");

    function variantsOfName(fullName) {
        const normalizedFullName = normalizeName(fullName || "");
        if (!normalizedFullName) return [];
        const parts = normalizedFullName.split(" ");
        const results = [parts];
        if (parts.length >= 3) {
            results.push([parts[0], parts[parts.length - 1]]);
        }
        return results;
    }

    const candidateNamesParts = [...variantsOfName(payload.full_name_latin), ...variantsOfName(payload.full_name_cyrillic)];

    return candidateNamesParts.some((candidateNameParts) => {
        if (candidateNameParts.length !== userParts.length) return false;
        return userParts.every((name, i) => name === candidateNameParts[i]);
    });
}
