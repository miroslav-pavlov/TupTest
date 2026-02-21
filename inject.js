(function () {
    const originalSetInterval = window.setInterval;

    window.setInterval = function (callback, delay) {
        if (delay === 1000) {
            const str = callback.toString();

            const isQuestionTimer = str.includes("return e-1") && !str.includes("calcTimeDelta");

            if (isQuestionTimer) {
                return 0;
            }
        }

        return originalSetInterval.apply(this, arguments);
    };
})();
