// content.js
(function () {
    "use strict";

    // Force Desktop Environment
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("spoof.js");
    script.async = false;
    document.documentElement.prepend(script);

    function main() {
        window.fullName = null;
        getFullName();

        breakEventListeners();

        breakTimer();

        createFloatingMenu();

        const btnFullscreen = document.getElementById("btn-fullscreen");
        addFullscreenButton(btnFullscreen);

        const btnBack = document.getElementById("btn-back");
        addBackButton(btnBack);

        const btnCopy = document.getElementById("btn-copy");
        addCopyButton(btnCopy);

        const btnAskAI = document.getElementById("btn-ask-ai");
        addAskAIButton(btnAskAI);
    }

    function breakEventListeners() {
        const events = [
            "fullscreenchange",
            "resize",
            "orientationchange",
            "focus",
            "blur",
            "visibilitychange",
            "copy",
            "cut",
            "paste",
            "contextmenu",
            "selectstart",
            "keydown",
            "keypress",
            "keyup",
        ];

        events.forEach((event) => {
            window.addEventListener(
                event,
                (e) => {
                    const target = e.target;

                    // Only run closest if target is a real Element
                    if (target instanceof Element && target.closest("#ai-window")) {
                        return;
                    }

                    e.stopImmediatePropagation();
                },
                true,
            );
        });
    }

    function breakTimer() {
        const script = document.createElement("script");

        script.src = chrome.runtime.getURL("inject.js");

        script.onload = function () {
            script.remove();
        };

        (document.head || document.documentElement).appendChild(script);
    }

    function addFullscreenButton(btn) {
        btn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }

    function addBackButton(btn) {
        btn.onclick = function () {
            const key = Object.keys(localStorage).find((k) => k.startsWith("current-question-"));

            if (!key) return;

            let current = parseInt(localStorage.getItem(key));

            if (current <= 0) return;

            const newValue = current - 1;

            // update storage
            localStorage.setItem(key, newValue);

            // notify React WITHOUT reload
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key: key,
                    newValue: newValue.toString(),
                    oldValue: current.toString(),
                    storageArea: localStorage,
                }),
            );
        };
    }

    function getFormattedQuestion(copyImagesAsURLs) {
        const allQuestionObjects = document.querySelectorAll('div[class*="Question_question__"]');
        prompt = "Solve the following questions with a short answer:\n";
        let questions = [];
        let questionIndex = 1;
        for (const questionObject of allQuestionObjects) {
            const questionDiv = questionObject.querySelector('div[class*="Question_disableSelection__"]');
            const questionDivTest = questionDiv.children[0].children[0].children[1];
            const questionDivImage = copyImagesAsURLs ? questionDiv.querySelector("img") : "";
            const question = questionDivTest?.value || questionDivTest?.textContent || "";
            const answerObjects = questionObject.querySelectorAll(".public-DraftStyleDefault-block");
            let answers = "";
            // Отворен отговор
            if (answerObjects.length == 0) {
                answers = "Answer:\n";
            } else {
                const answersRaw = [];
                for (let i = 1; i < answerObjects.length; i++) {
                    const cleanedText = answerObjects[i].innerText.trim();
                    if (cleanedText) answersRaw.push(cleanedText);
                }
                // Попълване на празни места
                if (questionObject.querySelector('span[contenteditable="true"]')) {
                    answers = "Given text:\n";
                    answers += answersRaw.join(" ____ ");
                }
                // Свързване на елементи
                else if (questionObject.querySelector('[class*="SolvableConnectPairs_part__"]')) {
                    answers += "Given answers:\n";
                    const mid = answersRaw.length / 2;
                    const answersSection = [];
                    answersRaw.forEach((ans, index) => {
                        const label = index + 1 <= mid ? index + 1 : numberToLetter(index + 1);
                        answersSection.push(`${label}. ${ans}`);
                    });
                    answers += answersSection.join("\n");
                }
                // Затворени отговори
                else {
                    // Трябва да форматираме на ново отговорите в случай че текстът е разкъсан от снимки
                    answersRaw.length = 0;
                    for (let i = 1; i < answerObjects.length; i++) {
                        const allTextObjectsInAnswer = [];
                        // answerObjects[i].querySelectorAll("span[data-offset-key]").forEach((ans) => {
                        answerObjects[i].childNodes.forEach((node) => {
                            let cleanedText = "";
                            if (node.tagName === "SPAN") {
                                cleanedText = node.innerText.trim();
                            } else if (copyImagesAsURLs) {
                                const src = node.src || node.getAttribute("src");
                                if (src) {
                                    cleanedText = src;
                                }
                            }
                            if (cleanedText) allTextObjectsInAnswer.push(cleanedText);
                        });
                        answersRaw.push(allTextObjectsInAnswer.join(" "));
                    }

                    answers += "Given answers:\n";
                    const answersSection = [];
                    answersRaw.forEach((ans, index) => {
                        answersSection.push(`${index + 1}. ${ans}`);
                    });
                    answers += answersSection.join("\n");
                }
            }
            questions.push(`${questionIndex}. ${question}\n${questionDivImage ? questionDivImage.src : ""}\n${answers}\n`);
            questionIndex++;
        }
        return prompt + questions.join("\n");
    }

    function addCopyButton(btn) {
        btn.onclick = function () {
            const text = getFormattedQuestion(true);
            navigator.clipboard.writeText(text);
        };
    }

    function addAskAIButton(btn) {
        btn.onclick = function () {
            const text = getFormattedQuestion(false);
            const toggleBtn = document.getElementById("tt-toggle");
            if (toggleBtn && toggleBtn.textContent === "Show AI") {
                toggleBtn.click();
            }
            window.sendMessage(text);
        };
    }

    function getFullName() {
        const interval = setInterval(() => {
            const nameInput = document.querySelector('input[name="name"]');
            const submitButton = document.querySelector("button.btn-primary.mx-auto.mt-2");

            if (submitButton && nameInput) {
                clearInterval(interval);

                submitButton.addEventListener(
                    "click",
                    function () {
                        window.fullName = nameInput.value;
                    },
                    { once: true },
                );
            }
        }, 500);
    }

    function numberToLetter(num) {
        if (num >= 1 && num <= 26) {
            return String.fromCharCode(96 + num);
        }
        return num;
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

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }
})();
