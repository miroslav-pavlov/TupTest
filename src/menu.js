// menu.js
async function createFloatingMenu(isOnMobile = false) {
    // ── Internal state ─────────────────────────────────────────────────────
    // Three stages mirroring the site's flow:
    //   "waiting_name"  – page just loaded, user hasn't typed name yet
    //   "waiting_login" – name submitted on site, user may now log in
    //   "waiting_start_test" – login succeeded, waiting for startTestButton to unlock menu
    //   "active"        – startTestButton clicked, full menu available
    let stage = "waiting_name";
    let capturedName = null;

    const {
        screenLogin,
        screenAI,
        screenButtons,
        loginUsername,
        loginPassword,
        loginBtn,
        loginError,
        tipLoginHint,
        messages,
        input,
        header,
        closeBtn,
        toggleMenusBtn,
        secretIcon,
        menu,
        btnFullscreen,
        btnBack,
        btnCopy,
        btnAskAI,
    } = createMenu(isOnMobile);

    async function applyStage() {
        // Always showing loginScreen until stage === "active"
        const isActive = stage === "active";

        screenLogin.style.display = isActive ? "none" : "flex";
        screenButtons.style.display = isActive ? "flex" : "none";
        screenAI.style.display = "none";
        toggleMenusBtn.style.display = isActive ? "block" : "none";
        if (isActive) toggleMenusBtn.textContent = "Покажи AI";

        // Input locking
        const canLogin = stage === "waiting_login";
        loginUsername.disabled = !canLogin;
        loginPassword.disabled = !canLogin;
        loginBtn.disabled = !canLogin;
        loginUsername.style.opacity = canLogin ? "1" : "0.45";
        loginPassword.style.opacity = canLogin ? "1" : "0.45";
        loginBtn.style.opacity = canLogin ? "1" : "0.45";

        switch (stage) {
            case "waiting_name":
                tipLoginHint.textContent = "Влез в акаунта си преди да започнеш тест! Първо въведи името си в сайта.";
                tipLoginHint.className = "tt-tip-login-base tt-tip-login-warning";
                break;
            case "waiting_login":
                tipLoginHint.textContent = "Влез в акаунта си.\n";
                tipLoginHint.className = "tt-tip-login-base tt-tip-login-waiting";
                break;
            case "waiting_start_test":
                tipLoginHint.textContent = 'Приет! Натисни "Започни теста" в сайта.';
                tipLoginHint.className = "tt-tip-login-base tt-tip-login-ready";
                // Clear credentials from view now that login succeeded
                loginUsername.value = "";
                loginPassword.value = "";
                loginError.style.display = "none";
                loginBtn.textContent = "Влез";

                // loginUsername.style.display = "none";
                // loginPassword.style.display = "none";
                // loginBtn.style.display = "none";
                // loginTitle.style.display = "none";
                break;
            case "active":
                // Activate breaks
                if (typeof window.onExtensionActivated === "function") {
                    window.onExtensionActivated();
                }
                break;
        }
    }

    // Initial state — restore to "active" if a valid session survived a refresh
    if (isTokenValid()) {
        const p = sessionPayload;
        // TODO: Save stored name to session
        // We can't know capturedName after a refresh (it was in memory),
        // but the name was already validated at login time, so it's safe to
        // go straight to active. content.js will still watch startTestButton on the
        // live page, but the user was already past that gate before refreshing.
        capturedName = p.full_name_latin || null;

        await fetchAndStoreConfig();

        try {
            const savedStage = sessionStorage.getItem(SS_STAGE_KEY);
            if (savedStage === "waiting_start_test") {
                stage = "waiting_start_test";
                restoredNameFromStorage = true;
            } else {
                stage = "active";
                if (typeof window.onExtensionActivated === "function") {
                    window.onExtensionActivated();
                }
            }
        } catch {
            stage = "active";
            if (typeof window.onExtensionActivated === "function") {
                window.onExtensionActivated();
            }
        }
        applyStage();
    } else {
        // No valid token — check if the user already entered their name before the reload
        try {
            const savedName = sessionStorage.getItem("tt_captured_name");
            console.log("found saved name");
            console.log(savedName);
            if (savedName) {
                capturedName = savedName;
                stage = "waiting_login";
                restoredNameFromStorage = true;
            } else {
                stage = "waiting_name";
            }
        } catch {
            stage = "waiting_name";
        }
        console.log(`stage is ${stage}`);
        applyStage();
    }

    // ═════════════════════════════════════════════════════════════════════════
    // CALLBACKS CALLED BY content.js
    // ═════════════════════════════════════════════════════════════════════════

    // Called when user clicks the "return to name input" button OR on page load.
    // clearSession() also removes the token from sessionStorage, so a refresh
    // after going back to the name screen will correctly start from scratch.
    window.onSiteStageReset = function () {
        if (restoredNameFromStorage) {
            restoredNameFromStorage = false;
            return;
        }

        capturedName = null;
        clearSession();
        try {
            sessionStorage.removeItem("tt_captured_name");
            sessionStorage.removeItem(SS_STAGE_KEY); // ← only clear on real reset
        } catch {}
        loginError.style.display = "none";
        stage = "waiting_name";
        applyStage();
    };

    // Called when user submits name with submitButton
    window.fullNameSubmitted = function (enteredName) {
        capturedName = enteredName;
        stage = "waiting_login";
        applyStage();
    };

    // Called when user clicks startTestButton
    window.onSiteStartTestBtnClicked = function () {
        try {
            sessionStorage.removeItem(SS_STAGE_KEY);
        } catch {}
        // Edge case: token expired between login and startTestButton press
        if (!isTokenValid()) {
            clearSession();
            stage = "waiting_login";
            applyStage();
            loginError.textContent = "Сесията изтече. Влез отново.";
            loginError.style.display = "block";
            return;
        }
        // Name was already validated inside doLogin — safe to proceed
        stage = "active";
        applyStage();
        if (typeof window.onExtensionActivated === "function") {
            window.onExtensionActivated();
        }
    };

    // TODO: Where should this go?
    loginBtn.addEventListener("click", doLogin);
    loginPassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doLogin();
    });

    // ═════════════════════════════════════════════════════════════════════════
    // CHAT / AI
    // ═════════════════════════════════════════════════════════════════════════

    function addMessage(text, isUser) {
        const pos = document.createElement("div");
        const msg = document.createElement("div");
        msg.className = "tt-msg " + (isUser ? "tt-user" : "tt-bot");
        pos.className = isUser ? "tt-user-position" : "tt-bot-position";
        renderMarkdownSafe(msg, text);
        pos.appendChild(msg);
        messages.appendChild(pos);
        messages.scrollTop = messages.scrollHeight;
    }

    addMessage("I am a free AI! I see only the last message, think slowly and work best in English!", false);

    async function sendMessage(textOverride = null) {
        // Block if not in active stage
        if (stage !== "active") return;

        if (!isTokenValid()) {
            clearSession();
            stage = "waiting_name";
            return;
        }

        let raw = textOverride;
        if (raw instanceof Event) raw = null;
        const text = (raw ?? input.value ?? "").toString().trim();
        if (!text) return;

        input.value = "";
        if (!window.ttIsOnMobile) {
            input.focus();
        } else {
            document.activeElement?.blur();
        }
        autoResizeTextarea(input);
        addMessage(text, true);

        // TODO: Request AI API Key at login in case of  server failure afterwards
        aiApiKey = requestAiApiKey(sessionToken);
        if (!aiApiKey) {
            addMessage("Не може да се получи AI ключ. Моля опитай пак.", false);
            // TODO: Clears session but doesn't return to login because intended way was trough logout button. Return logout button in case of error?

            // clearSession();
            // stage = "waiting_name";
            return;
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: "Bearer " + aiApiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: CONFIG.model,
                messages: [{ role: "user", content: text }],
                stream: true,
            }),
        });

        const pos = document.createElement("div");
        const msg = document.createElement("div");
        msg.className = "tt-msg tt-bot";
        pos.className = "tt-bot-position";
        msg.textContent = "Thinking…";
        pos.appendChild(msg);
        messages.appendChild(pos);

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let hasStarted = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value, { stream: true }).split("\n")) {
                if (!line.startsWith("data:")) continue;
                const jsonStr = line.slice(5).trim();
                if (jsonStr === "[DONE]") return;
                try {
                    const token = JSON.parse(jsonStr).choices?.[0]?.delta?.content || "";
                    if (token) {
                        if (!hasStarted) {
                            msg.innerHTML = "";
                            hasStarted = true;
                        }
                        fullText += token;
                        msg.innerHTML = "";
                        renderMarkdownSafe(msg, fullText);
                        messages.scrollTop = messages.scrollHeight;
                    }
                } catch {}
            }
        }
    }

    window.sendMessage = sendMessage;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && screenAI.style.display !== "none") {
            e.preventDefault();
            sendMessage();
        }
    });
    send.addEventListener("click", sendMessage);
    input.addEventListener("input", () => autoResizeTextarea(input));
    autoResizeTextarea(input);
}
