// credentials.js
const CRED_KEY = "tt_saved_credentials";

function saveCredentials(username, password, siteName, siteNumber) {
    try {
        localStorage.setItem(CRED_KEY, JSON.stringify({ username, password, siteName, siteNumber }));
    } catch {}
}

function loadCredentials() {
    try {
        const raw = localStorage.getItem(CRED_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.username && parsed?.password && parsed?.siteName && parsed?.siteNumber) return parsed;
        return null;
    } catch {
        return null;
    }
}

function clearCredentials() {
    try {
        localStorage.removeItem(CRED_KEY);
    } catch {}
}
