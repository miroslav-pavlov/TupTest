// spoof.js
(function () {
    const override = (obj, prop, value) => {
        try {
            Object.defineProperty(obj, prop, {
                get: () => value,
                configurable: true,
            });
        } catch (e) {}
    };

    override(
        Navigator.prototype,
        "userAgent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    );

    override(Navigator.prototype, "platform", "Win32");
    override(Navigator.prototype, "maxTouchPoints", 0);
    override(Navigator.prototype, "vendor", "Google Inc.");

    override(window, "innerWidth", 1920);
    override(window, "innerHeight", 1080);

    override(screen, "width", 1920);
    override(screen, "height", 1080);

    try {
        if (!("userAgentData" in Navigator.prototype)) {
            Object.defineProperty(Navigator.prototype, "userAgentData", {
                get: () => ({
                    mobile: false,
                    platform: "Windows",
                    brands: [
                        { brand: "Google Chrome", version: "120" },
                        { brand: "Chromium", version: "120" },
                    ],
                }),
                configurable: true,
            });
        }
    } catch (e) {}

    const originalReplace = window.location.replace.bind(window.location);

    window.location.replace = function (url) {
        if (typeof url === "string") {
            const lower = url.toLowerCase();

            if (
                lower.includes("/app") ||
                lower.includes("#/app") ||
                lower.includes("mobile") ||
                lower.includes("intent://") ||
                lower.includes("android-app://")
            ) {
                return;
            }
        }

        return originalReplace(url);
    };
})();
