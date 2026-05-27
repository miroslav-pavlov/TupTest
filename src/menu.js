// menu.js
function createFloatingMenu(isOnMobile = false) {
    createMenu(isOnMobile);

    window.onExtensionActivated = function () {};
    window.onSiteStartTestBtnClicked = function () {
        try {
            const watermark = document.getElementById("tt-status");
            if (watermark) {
                watermark.style.display = "none";
            }
        } catch(e){
            console.error("Error hiding watermark:", e);
        }
    };

    window.fullNameSubmitted = function (enteredName, enteredNumber) {
        window.fullName = enteredName;
        window.classNumber = enteredNumber;
    };

    window.onSiteStageReset = function () {};
}