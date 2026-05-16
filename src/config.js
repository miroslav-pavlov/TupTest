// config.js
const CONFIG = {
    // server: "https://h.tuptest.xyz",
    server: "http://127.0.0.1",

    ai: {
        key: null,
        model: "nvidia/nemotron-nano-12b-v2-vl:free", // fallback if server omits it
        // temperature: 0.7,
        // max_tokens: 2048,
    },
    // features: {},
    blockedEvents: null,
};

async function fetchAndStoreConfig(sessionToken) {
    try {
        const res = await fetch(`${CONFIG.server}/i5agf9xeqa`, {
            headers: { Authorization: "Bearer " + sessionToken },
        });
        if (!res.ok) return;

        const cfg = await res.json();

        if (cfg.ai) {
            if (cfg.ai.key) CONFIG.ai.key = cfg.ai.key;
            if (cfg.ai.model) CONFIG.ai.model = cfg.ai.model;
            // if (cfg.ai.temperature) CONFIG.ai.temperature = cfg.ai.temperature;
            // if (cfg.ai.max_tokens) CONFIG.ai.max_tokens = cfg.ai.max_tokens;
        }

        // if (cfg.features && typeof cfg.features === "object") {
        //     CONFIG.features = cfg.features;
        // }

        if (Array.isArray(cfg.blocked_events)) {
            CONFIG.blockedEvents = cfg.blocked_events;
        }
    } catch {}
}
