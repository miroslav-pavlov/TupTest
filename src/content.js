// content.js
(function () {
    "use strict";

    window.ttIsOnMobile = (function () {
        const realUA = navigator.userAgent;
        const realMaxTouch = navigator.maxTouchPoints;
        const realWidth = screen.width;
        return /Mobi|Android|iPhone|iPad|IEMobile/i.test(realUA) || realMaxTouch > 0 || realWidth < 768;
    })();

    // Force Desktop Environment
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("spoof.js");
    script.async = false;
    document.documentElement.prepend(script);

    function main() {
        window.fullName = null;

        window.onExtensionActivated = function () {
            breakEventListeners();
            breakTimer();
        };

        // Build floating menu
        createFloatingMenu(window.ttIsOnMobile);
        enableFullscreenButton(document.getElementById("btn-fullscreen"));
        enableBackButton(document.getElementById("btn-back"));
        enableCopyButton(document.getElementById("btn-copy"));
        enableAskAIButton(document.getElementById("btn-ask-ai"));

        // Kick off the name-capture / site-button watcher
        startNameFlow();
    }

    let fullNameBtnObserver = null;
    let returnBtnObserver = null;
    let startTestBtnObserver = null;

    function startNameFlow() {
        stopNameFlow();

        if (typeof window.onSiteStageReset === "function") {
            window.onSiteStageReset();
        }

        // In case of site restart after already submitting name there is no longer a submit button to attach to
        try {
            if (sessionStorage.getItem("tt_captured_name")) {
                FindReturnButton();
                return;
            }
        } catch {}

        function tryAttachNameBtn() {
            const nameInput = document.querySelector('input[name="name"]');
            const submitButton = document.querySelector("button.btn-primary.mx-auto.mt-2");
            if (!nameInput || !submitButton) return false;

            submitButton.addEventListener(
                "click",
                function () {
                    const nameValue = nameInput.value.trim();

                    // In case the user sets name but has number over 100 (get full name fires but user can change it afterwards)
                    const observer = new MutationObserver(() => {
                        if (!document.contains(submitButton)) {
                            observer.disconnect();

                            window.fullName = nameValue;
                            try {
                                sessionStorage.setItem("tt_captured_name", window.fullName);
                            } catch {}

                            if (typeof window.fullNameSubmitted === "function") {
                                window.fullNameSubmitted(window.fullName);
                            }

                            FindReturnButton();
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                },
                { once: true },
            );

            return true;
        }

        if (!tryAttachNameBtn()) {
            fullNameBtnObserver = new MutationObserver(() => {
                if (tryAttachNameBtn()) {
                    fullNameBtnObserver.disconnect();
                    fullNameBtnObserver = null;
                }
            });
            fullNameBtnObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function FindReturnButton() {
        function tryAttachReturnBtn() {
            const root = document.getElementById("root");
            if (!root) return false;

            const returnBtn = root.children[1]?.children[0]?.children[0]?.children[1]?.children[0]?.querySelector(
                "button.btn-default.color-blue.m-1",
            );
            if (!returnBtn) return false;

            returnBtn.addEventListener(
                "click",
                function () {
                    window.fullName = null;
                    try {
                        sessionStorage.removeItem("tt_captured_name");
                    } catch {}
                    startNameFlow();
                },
                { once: true },
            );

            return true;
        }

        if (!tryAttachReturnBtn()) {
            returnBtnObserver = new MutationObserver(() => {
                if (tryAttachReturnBtn()) {
                    returnBtnObserver.disconnect();
                    returnBtnObserver = null;
                }
            });
            returnBtnObserver.observe(document.body, { childList: true, subtree: true });
        }

        FindStartTestBtn();
    }

    function FindStartTestBtn() {
        function tryAttachStartTestBtn() {
            const startTestBtn = document.querySelector("button.btn-lg");
            if (!startTestBtn) return false;

            startTestBtn.addEventListener(
                "click",
                function () {
                    if (typeof window.onSiteStartTestBtnClicked === "function") {
                        window.onSiteStartTestBtnClicked();
                    }
                },
                { once: true },
            );

            return true;
        }

        if (!tryAttachStartTestBtn()) {
            startTestBtnObserver = new MutationObserver(() => {
                if (tryAttachStartTestBtn()) {
                    startTestBtnObserver.disconnect();
                    startTestBtnObserver = null;
                }
            });
            startTestBtnObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function stopNameFlow() {
        if (fullNameBtnObserver) {
            fullNameBtnObserver.disconnect();
            fullNameBtnObserver = null;
        }
        if (returnBtnObserver) {
            returnBtnObserver.disconnect();
            returnBtnObserver = null;
        }
        if (startTestBtnObserver) {
            startTestBtnObserver.disconnect();
            startTestBtnObserver = null;
        }
    }

    function breakEventListeners() {
        let events = window.blockedEvents;
        // if (!events || events.length == 0) {
        //     events = [
        //         "fullscreenchange",
        //         "resize",
        //         "orientationchange",
        //         "focus",
        //         "blur",
        //         "visibilitychange",
        //         "copy",
        //         "cut",
        //         "paste",
        //         "contextmenu",
        //         "selectstart",
        //         "keydown",
        //         "keypress",
        //         "keyup",
        //     ];
        //     console.log("Couldn't pull events")
        // }

        events.forEach((event) => {
            window.addEventListener(
                event,
                (e) => {
                    // Allow Tab hotkey to always pass through
                    if (e.key === "Tab") return;

                    const target = e.target;
                    if (target instanceof Element && target.closest("#tt-window")) return;
                    e.stopImmediatePropagation();
                },
                true,
            );
        });
    }

    function breakTimer() {
        const s = document.createElement("script");
        s.src = chrome.runtime.getURL("inject.js");
        s.onload = function () {
            s.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }

    function enableFullscreenButton(btnObject) {
        btnObject.addEventListener("click", () => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
        });
    }

    function enableBackButton(btnObject) {
        btnObject.onclick = function () {
            const key = Object.keys(localStorage).find((k) => k.startsWith("current-question-"));
            if (!key) return;
            const current = parseInt(localStorage.getItem(key));
            if (current <= 0) return;
            const newValue = current - 1;
            localStorage.setItem(key, newValue);
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key,
                    newValue: newValue.toString(),
                    oldValue: current.toString(),
                    storageArea: localStorage,
                }),
            );
        };
    }

    function getFormattedQuestion(copyImagesAsURLs) {
        const allQuestionObjects = document.querySelectorAll('div[class*="Question_question__"]');
        let prompt = "Solve the following questions with a short answer:\n";
        let questions = [];
        let idx = 1;

        for (const qObj of allQuestionObjects) {
            const qDiv = qObj.querySelector('div[class*="Question_disableSelection__"]');
            const qTest = qDiv.children[0].children[0].children[1];
            const qImg = copyImagesAsURLs ? qDiv.querySelector("img") : null;
            const qText = qTest?.value || qTest?.textContent || "";
            const ansEls = qObj.querySelectorAll(".public-DraftStyleDefault-block");
            let answers = "";

            if (ansEls.length === 0) {
                answers = "Answer:\n";
            } else {
                const raw = [];
                for (let i = 1; i < ansEls.length; i++) {
                    const t = ansEls[i].innerText.trim();
                    if (t) raw.push(t);
                }

                if (qObj.querySelector('span[contenteditable="true"]')) {
                    answers = "Given text:\n" + raw.join(" ____ ");
                } else if (qObj.querySelector('[class*="SolvableConnectPairs_part__"]')) {
                    const mid = raw.length / 2;
                    answers =
                        "Given answers:\n" +
                        raw.map((a, i) => `${i + 1 <= mid ? i + 1 : numberToLetter(i + 1)}. ${a}`).join("\n");
                } else {
                    raw.length = 0;
                    for (let i = 1; i < ansEls.length; i++) {
                        const parts = [];
                        ansEls[i].childNodes.forEach((node) => {
                            let t = "";
                            if (node.tagName === "SPAN") {
                                t = node.innerText.trim();
                            } else if (copyImagesAsURLs) {
                                const src = node.src || node.getAttribute?.("src");
                                if (src) t = src;
                            }
                            if (t) parts.push(t);
                        });
                        raw.push(parts.join(" "));
                    }
                    answers = "Given answers:\n" + raw.map((a, i) => `${i + 1}. ${a}`).join("\n");
                }
            }

            questions.push(`${idx}. ${qText}\n${qImg ? qImg.src : ""}\n${answers}\n`);
            idx++;
        }

        return prompt + questions.join("\n");
    }

    function enableCopyButton(btnObject) {
        btnObject.onclick = function () {
            navigator.clipboard.writeText(getFormattedQuestion(true));
        };
    }

    function enableAskAIButton(btnObject) {
        btnObject.onclick = function () {
            const text = getFormattedQuestion(false);
            const toggleBtn = document.getElementById("tt-toggle");
            if (toggleBtn && toggleBtn.textContent === "Покажи AI") toggleBtn.click();
            window.sendMessage(text);
        };
    }

    waitForBody(main);

    function waitForBody(callback) {
        if (document.body) {
            callback();
            return;
        }
        const observer = new MutationObserver(() => {
            if (document.body) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
