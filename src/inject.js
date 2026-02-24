// inject.js
(function () {
    // ── Timer break ───────────────────────────────────────────────────────
    const originalSetInterval = window.setInterval;

    window.setInterval = function (callback, delay) {
        if (delay === 1000) {
            const str = callback.toString();
            const isQuestionTimer = str.includes("return e-1") && !str.includes("calcTimeDelta");
            if (isQuestionTimer) return 0;
        }
        return originalSetInterval.apply(this, arguments);
    };

    // ── Cheating counter + refresh detection break ─────────────────────
    const _origGetItem = localStorage.getItem.bind(localStorage);
    const _origSetItem = localStorage.setItem.bind(localStorage);

    localStorage.getItem = function (key) {
        if (key && (key.startsWith("ct-") || key.startsWith("sm-"))) return null;
        return _origGetItem(key);
    };

    localStorage.setItem = function (key, value) {
        if (key && (key.startsWith("ct-") || key.startsWith("sm-"))) return;
        return _origSetItem(key, value);
    };
})();
