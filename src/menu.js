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
    let capturedNumber = null;

    const {
        screenLogin,
        screenAI,
        screenButtons,
        tipLoginHint,
        loginUsername,
        loginPassword,
        loginError,
        loginBtn,
        autoLoginBtn,
        messages,
        input,
        send,
        toggleMenusBtn,
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

        const creds = loadCredentials();
        const showAutoLogin = (stage === "waiting_name" || stage === "waiting_login") && !!creds;
        autoLoginBtn.style.display = showAutoLogin ? "block" : "none";
        autoLoginBtn.textContent = creds ? `Влез като ${creds.username}` : "Влез автоматично";
        autoLoginBtn.className = showAutoLogin ? "tt-button" : "tt-button tt-button-secondary";
        loginBtn.className = showAutoLogin ? "tt-button tt-button-secondary" : "tt-button";

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
                // TODO: Does it even need to use window if all files are merged. Security exploit?
                if (typeof window.onExtensionActivated === "function") {
                    window.onExtensionActivated();
                }
                try {
                    const watermark = document.getElementById("tt-status");
                    watermark.style.display = "none";
                } catch {}
                break;
        }
    }

    // Initial state — restore to "active" if a valid session survived a refresh
    if (isTokenValid()) {
        const p = sessionPayload;
        // TODO: Save stored name to session (Done? Make sure this has been already taken care of)
        // We can't know capturedName after a refresh (it was in memory),
        // but the name was already validated at login time, so it's safe to
        // go straight to active. content.js will still watch startTestButton on the
        // live page, but the user was already past that gate before refreshing.
        capturedName = p.full_name_latin || null;

        await fetchAndStoreConfig(sessionToken);

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
            const savedNumber = sessionStorage.getItem("tt_captured_number");
            if (savedName && savedNumber) {
                capturedName = savedName;
                capturedNumber = savedNumber;
                stage = "waiting_login";
                restoredNameFromStorage = true;
            } else {
                stage = "waiting_name";
            }
        } catch {
            stage = "waiting_name";
        }
        applyStage();
    }

    // TODO: Too interwieved with menu.js. Move to auth.js and return only status and let menu.js handle rendering
    // TODO: On start autofill name and number. On fullNameBtn try to log in with saved info.
    async function doLogin() {
        if (stage !== "waiting_login") return;

        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (!username || !password) {
            loginError.textContent = "Моля въведи потребителско име и парола.";
            loginError.style.display = "block";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Влизане...";
        loginError.style.display = "none";

        try {
            const res = await fetch(`${CONFIG.server}/ol2o5mfn65`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (!res.ok || !data.access_token) {
                loginError.textContent = data.detail || "Грешно потребителско име или парола.";
                loginError.style.display = "block";
                return;
            }

            storeSession(data.access_token);

            if (!isTokenValid()) {
                loginError.textContent = "Получен е невалиден токен от сървъра.";
                loginError.style.display = "block";
                clearSession();
                return;
            }

            fetchAndStoreConfig(sessionToken)

            const payload = sessionPayload;
            if (!payload.subscription_active) {
                loginError.textContent = "Абонаментът не е активен. Свържи се с администратор.";
                loginError.style.display = "block";
                clearSession();
                return;
            }

            if (capturedName && !namesMatch(capturedName)) {
                const expectedLatin = payload.full_name_latin || "";
                const expectedCyrillic = payload.full_name_cyrillic || "";
                loginError.textContent = `Името не съвпада - върни се и го поправи.\nВъведено:\n${capturedName}\nРегистрирано:\n${expectedCyrillic}\n${expectedLatin}`;
                // TODO: Instead of wrong name error automaticaly change it to English first and last name with a popup explaining the change.
                // loginError.textContent = `Името в сайта не съвпада и ТъпТест автоматично го промени на ${"<name without middle>"}.\nВалидни имена са:\n${"<Име без средно>"}\n${expectedCyrillic}\n${"<name without middle>"}\n${expectedLatin}`;
                loginError.style.display = "block";
                clearSession();
                return;
            }

            // Success — but stay on login screen until startTestButton is pressed
            stage = "waiting_start_test";
            saveCredentials(username, password, capturedName, capturedNumber);
            try {
                sessionStorage.setItem(SS_STAGE_KEY, "waiting_start_test");
            } catch {}
            applyStage();
        } catch (e) {
            // FIXME: Menu shows logged in when connection to server was actually refused
            loginError.textContent = "Проблем с връзката към сървъра.";
            loginError.style.display = "block";
            console.error(e);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Влез";
        }

        const testAlreadyStarted = !!(
            document.querySelector("button.btn-primary.btn-md") || document.querySelector("[class*='Blocker_blocker']")
        );

        if (testAlreadyStarted) {
            try {
                sessionStorage.removeItem(SS_STAGE_KEY);
            } catch {}
            stage = "active";
            applyStage();
            if (typeof window.onExtensionActivated === "function") {
                window.onExtensionActivated();
            }
        } else {
            stage = "waiting_start_test";
            try {
                sessionStorage.setItem(SS_STAGE_KEY, "waiting_start_test");
            } catch {}
            applyStage();
        }
    }

    // TODO: Rewrite callbacks to be more secure as anyone can call window.<something> and set logged in to true
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
        capturedNumber = null;
        clearSession();
        try {
            sessionStorage.removeItem("tt_captured_name");
            sessionStorage.removeItem("tt_captured_number");
            sessionStorage.removeItem(SS_STAGE_KEY);
        } catch {}
        loginError.style.display = "none";
        stage = "waiting_name";
        applyStage();

        if (window.pendingAutoLogin) {
            const creds = loadCredentials();
            if (creds && typeof window.onAutofillSiteName === "function") {
                // TODO: Janky way to fix the issue? Try to fix it when dealing with window migration.
                setTimeout(() => {
                    window.onAutofillSiteName(creds.siteName, creds.siteNumber);
                }, 0);
            }
        }
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

    autoLoginBtn.addEventListener("click", async () => {
        const creds = loadCredentials();
        if (!creds) return;

        if (stage === "waiting_login" && (capturedName !== creds.siteName || capturedNumber !== creds.siteNumber)) {
            // Wrong name/number is on the site — go back and re-enter the correct ones
            window.pendingAutoLogin = true;
            if (typeof window.onAutofillReturnToName === "function") {
                window.onAutofillReturnToName();
            }
            // onSiteStageReset will fire naturally from startNameFlow(),
            // which sets stage to waiting_name, then onAutofillSiteName fires
            // once fullNameSubmitted advances us back to waiting_login
            return;
        }

        if (stage === "waiting_name") {
            window.pendingAutoLogin = true;
            if (typeof window.onAutofillSiteName === "function") {
                window.onAutofillSiteName(creds.siteName, creds.siteNumber);
            }
            return;
        }

        // waiting_login — fill and submit
        loginUsername.value = creds.username;
        loginPassword.value = creds.password;
        await doLogin();
    });

    // Called when user submits name with submitButton
    window.fullNameSubmitted = function (enteredName, enteredNumber) {
        capturedName = enteredName;
        capturedNumber = enteredNumber;
        stage = "waiting_login";
        applyStage();

        // If autofill was triggered from waiting_name, finish logging in now
        if (window.pendingAutoLogin) {
            window.pendingAutoLogin = false;
            autoLoginBtn.click();
        }
    };

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

        if (!CONFIG.ai.key) {
            addMessage("Не може да се получи AI ключ. Моля опитай пак.", false);

            // TODO: Clears session but doesn't return to login because intended way was trough logout button. Return logout button in case of error?
            // clearSession();
            // stage = "waiting_name";
            return;
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: "Bearer " + CONFIG.ai.key, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: CONFIG.ai.model,
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
