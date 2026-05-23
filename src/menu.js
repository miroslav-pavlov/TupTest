// menu.js
function createFloatingMenu(isOnMobile = false) {
    createMenu(isOnMobile);

    window.onExtensionActivated = function () {
        try {
            const watermark = document.getElementById("tt-status");
            if (watermark) {
                watermark.style.display = "none";
            }
        } catch {}
    };

    window.fullNameSubmitted = function (enteredName, enteredNumber) {
        window.fullName = enteredName;
        window.classNumber = enteredNumber;
    };

    window.onSiteStartTestBtnClicked = function () {};
    window.onSiteStageReset = function () {};
}