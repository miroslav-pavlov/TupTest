// config.js
let aiApiKey = null;
window.blockedEvents = null;
const CONFIG = {
    server: "https://h.tuptest.xyz",
    model: "nvidia/nemotron-nano-12b-v2-vl:free",
};

// Fetch AI API Key only once in case of server failure
async function requestAiApiKey(sessionToken) {
    if (aiApiKey) {
        return aiApiKey;
    }
    try {
        const keyRes = await fetch(`${CONFIG.server}/hvx6yoogbh`, {
            headers: { Authorization: "Bearer " + sessionToken },
        });
        if (!keyRes.ok) throw new Error("key fetch failed");
        aiApiKey = (await keyRes.json()).key;
        return aiApiKey;
    } catch {
        return null;
    }
}
