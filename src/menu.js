// menu.js
const SERVER = "https://h.tuptest.xyz";

const SS_KEY = "tt_token";
const SS_STAGE_KEY = "tt_stage";

let sessionToken = null;
let sessionPayload = null;
let aiApiKey = null;
let restoredNameFromStorage = false;
window.blockedEvents = null;

async function fetchAndStoreConfig() {
    try {
        const cfgRes = await fetch(`${SERVER}/i5agf9xeqa`, {
            headers: { Authorization: "Bearer " + sessionToken },
        });
        if (cfgRes.ok) {
            const cfg = await cfgRes.json();
            if (Array.isArray(cfg.blocked_events)) {
                window.blockedEvents = cfg.blocked_events;
            }
        }
    } catch {}
}

function parsePayload(token) {
    try {
        const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(b64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join(""),
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function storeSession(token) {
    sessionToken = token;
    sessionPayload = parsePayload(token);
    try {
        sessionStorage.setItem(SS_KEY, token);
    } catch {}
}

function clearSession() {
    sessionToken = null;
    sessionPayload = null;
    try {
        sessionStorage.removeItem(SS_KEY);
    } catch {}
}

function isTokenValid() {
    if (!sessionToken || !sessionPayload) return false;
    return sessionPayload.exp && sessionPayload.exp > Math.floor(Date.now() / 1000);
}

// ── Restore session from sessionStorage on script load ────────────────────
// Runs once when the content script is injected (i.e. on every page load/
// refresh). If a valid token is found the stage will be restored below.
(function restoreSession() {
    try {
        const saved = sessionStorage.getItem(SS_KEY);
        if (!saved) return;
        const payload = parsePayload(saved);
        if (!payload) {
            sessionStorage.removeItem(SS_KEY);
            return;
        }
        const now = Math.floor(Date.now() / 1000);
        if (!payload.exp || payload.exp <= now) {
            sessionStorage.removeItem(SS_KEY);
            return;
        }
        sessionToken = saved;
        sessionPayload = payload;
    } catch {}
})();
// Also turns cyrillic into latin
function normalizeName(str) {
    return (str || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, " ");
}

async function createFloatingMenu() {
    const CONFIG = { model: "nvidia/nemotron-nano-12b-v2-vl:free" };

    // ── Internal state ─────────────────────────────────────────────────────
    // Three stages mirroring the site's flow:
    //   "waiting_name"  – page just loaded, user hasn't typed name yet
    //   "waiting_login" – name submitted on site, user may now log in
    //   "waiting_start_test" – login succeeded, waiting for startTestButton to unlock menu
    //   "active"        – startTestButton clicked, full menu available
    let stage = "waiting_name";
    let capturedName = null;

    const secretIcon = document.createElement("div");
    secretIcon.id = "secret-icon";
    document.body.appendChild(secretIcon);

    const menu = document.createElement("div");
    menu.id = "tt-window";
    menu.style.display = "none";
    document.body.appendChild(menu);

    const header = document.createElement("div");
    header.id = "tt-header";
    const title = document.createElement("div");
    title.textContent = "ТъпТест";
    const closeBtn = document.createElement("div");
    closeBtn.id = "tt-close";
    closeBtn.textContent = "✕";
    header.appendChild(title);
    header.appendChild(closeBtn);
    menu.appendChild(header);

    // Wrapper for LoginScreen, ButtonsScreen and AIScreen
    const content = document.createElement("div");
    content.id = "tt-content";
    menu.appendChild(content);

    const loginScreen = document.createElement("div");
    loginScreen.id = "login-screen";
    loginScreen.className = "tt-screen";
    loginScreen.style.display = "flex";
    content.appendChild(loginScreen);

    const loginInner = document.createElement("div");
    loginInner.id = "login-inner";
    loginScreen.appendChild(loginInner);

    const loginWarning = document.createElement("div");
    loginWarning.id = "login-warning";
    loginWarning.className = "tt-login-warning";
    loginWarning.textContent = "Влез в акаунта си преди да започнеш тест! ( препоръчително )";
    loginInner.appendChild(loginWarning);

    const tabHint = document.createElement("div");
    tabHint.id = "tab-hint";
    tabHint.className = "tt-login-hint tt-hint-waiting";
    tabHint.textContent = "С бутона TAB можеш да скриеш менюто.";
    loginInner.appendChild(tabHint);

    const loginHint = document.createElement("div");
    loginHint.id = "login-hint";
    loginHint.className = "tt-login-hint";
    loginInner.appendChild(loginHint);

    const loginTitle = document.createElement("div");
    loginTitle.className = "tt-section-label";
    loginTitle.textContent = "Вход";
    loginInner.appendChild(loginTitle);

    const loginUsername = document.createElement("input");
    loginUsername.type = "text";
    loginUsername.id = "login-username";
    loginUsername.placeholder = "Потребителско име";
    loginUsername.className = "tt-login-input";
    loginInner.appendChild(loginUsername);

    const loginPassword = document.createElement("input");
    loginPassword.type = "password";
    loginPassword.id = "login-password";
    loginPassword.placeholder = "Парола";
    loginPassword.className = "tt-login-input";
    loginInner.appendChild(loginPassword);

    const loginError = document.createElement("div");
    loginError.id = "login-error";
    loginError.className = "tt-login-error";
    loginError.style.display = "none";
    loginInner.appendChild(loginError);

    const loginBtn = document.createElement("button");
    loginBtn.className = "tt-button";
    loginBtn.textContent = "Влез";
    loginInner.appendChild(loginBtn);

    const aiScreen = document.createElement("div");
    aiScreen.id = "tt-screen";
    aiScreen.className = "tt-screen";
    aiScreen.style.display = "none";
    content.appendChild(aiScreen);

    const messages = document.createElement("div");
    messages.id = "tt-messages";
    aiScreen.appendChild(messages);

    const inputArea = document.createElement("div");
    inputArea.id = "tt-input-area";

    const input = document.createElement("textarea");
    input.id = "tt-input";
    input.placeholder = "Ask anything…";

    const send = document.createElement("button");
    send.className = "tt-button";
    send.textContent = "Send";

    inputArea.appendChild(input);
    inputArea.appendChild(send);
    aiScreen.appendChild(inputArea);

    const buttonsScreen = document.createElement("div");
    buttonsScreen.id = "buttons-screen";
    buttonsScreen.className = "tt-screen";
    buttonsScreen.style.display = "none";
    content.appendChild(buttonsScreen);

    const badgesRow = document.createElement("div");
    badgesRow.className = "tt-badges-row";
    const badge1 = document.createElement("div");
    badge1.className = "tt-badge";
    badge1.textContent = "Anti-Cheat Break";
    const badge2 = document.createElement("div");
    badge2.className = "tt-badge";
    badge2.textContent = "Timer Break";
    const badge3 = document.createElement("div");
    badge3.className = "tt-badge";
    badge3.textContent = "Infinite Warnings";
    const badge4 = document.createElement("div");
    badge4.className = "tt-badge";
    badge4.textContent = "Refresh Break";
    badgesRow.appendChild(badge1);
    badgesRow.appendChild(badge2);
    badgesRow.appendChild(badge3);
    badgesRow.appendChild(badge4);
    buttonsScreen.appendChild(badgesRow);

    const sectionLabel = document.createElement("div");
    sectionLabel.className = "tt-section-label";
    sectionLabel.textContent = "Действия";
    buttonsScreen.appendChild(sectionLabel);

    const submitNotice = document.createElement("div");
    submitNotice.className = "tt-login-hint tt-hint-waiting";
    submitNotice.textContent = "Затвори таба, ако искаш да спреш изпращането на теста.";
    buttonsScreen.appendChild(submitNotice);

    const btnFullscreen = document.createElement("button");
    btnFullscreen.textContent = "Toggle Fullscreen";
    btnFullscreen.className = "tt-button";
    btnFullscreen.id = "btn-fullscreen";
    buttonsScreen.appendChild(btnFullscreen);

    const btnBack = document.createElement("button");
    btnBack.textContent = "Предишен въпрос";
    btnBack.className = "tt-button";
    btnBack.id = "btn-back";
    buttonsScreen.appendChild(btnBack);

    const btnCopy = document.createElement("button");
    btnCopy.textContent = "Копирай въпрос/и\n( Поддържа снимки )";
    btnCopy.className = "tt-button";
    btnCopy.id = "btn-copy";
    buttonsScreen.appendChild(btnCopy);

    const btnAskAI = document.createElement("button");
    btnAskAI.textContent = "Попитай AI\n( Не поддържа снимки )";
    btnAskAI.className = "tt-button";
    btnAskAI.id = "btn-ask-ai";
    buttonsScreen.appendChild(btnAskAI);

    const toggleMenusBtn = document.createElement("button");
    toggleMenusBtn.id = "tt-toggle";
    toggleMenusBtn.style.display = "none";
    toggleMenusBtn.textContent = "Show AI";
    menu.appendChild(toggleMenusBtn);

    async function applyStage() {
        // Always showing loginScreen until stage === "active"
        const isActive = stage === "active";

        loginScreen.style.display = isActive ? "none" : "flex";
        buttonsScreen.style.display = isActive ? "flex" : "none";
        aiScreen.style.display = "none";
        toggleMenusBtn.style.display = isActive ? "block" : "none";
        if (isActive) toggleMenusBtn.textContent = "Show AI";
        loginWarning.style.display = isActive ? "none" : "block";

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
                loginHint.textContent = "Въведи името си в сайта първо.";
                loginHint.className = "tt-login-hint tt-hint-waiting";
                break;
            case "waiting_login":
                loginHint.textContent = "Името е въведено. Влез в акаунта си.\n";
                loginHint.className = "tt-login-hint tt-hint-ready";
                break;
            case "waiting_start_test":
                loginHint.textContent = 'Приет. Натисни "Започни теста" в сайта.';
                loginHint.className = "tt-login-hint tt-hint-waiting";
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
                // ------   Removed user badge

                // Show user badge in menu
                // const p = sessionPayload;
                // if (p) {
                //     userBadge.textContent = `${p.full_name_cyrillic || p.sub}`;
                //     userBadge.style.display = "block";
                // }
                break;
        }
    }

    // Initial state — restore to "active" if a valid session survived a refresh
    if (isTokenValid()) {
        const p = sessionPayload;
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

    function namesMatch(userName) {
        const payload = sessionPayload;
        if (!payload) return false;

        const normalizedUserName = normalizeName(userName);
        if (!normalizedUserName) return false;

        const userParts = normalizedUserName.split(" ");

        function variantsOfName(fullName) {
            const normalizedFullName = normalizeName(fullName || "");
            if (!normalizedFullName) return [];
            const parts = normalizedFullName.split(" ");
            const results = [parts];
            if (parts.length >= 3) {
                results.push([parts[0], parts[parts.length - 1]]);
            }
            return results;
        }

        const candidateNamesParts = [...variantsOfName(payload.full_name_latin), ...variantsOfName(payload.full_name_cyrillic)];

        return candidateNamesParts.some((candidateNameParts) => {
            if (candidateNameParts.length !== userParts.length) return false;
            return userParts.every((name, i) => name === candidateNameParts[i]);
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // LOGIN LOGIC
    // ═════════════════════════════════════════════════════════════════════════

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
            const res = await fetch(`${SERVER}/ol2o5mfn65`, {
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

            try {
                const cfgRes = await fetch(`${SERVER}/i5agf9xeqa`, {
                    headers: { Authorization: "Bearer " + sessionToken },
                });
                if (cfgRes.ok) {
                    const cfg = await cfgRes.json();
                    if (Array.isArray(cfg.blocked_events)) {
                        window.blockedEvents = cfg.blocked_events;
                    }
                }
            } catch {}

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
                loginError.style.display = "block";
                clearSession();
                return;
            }

            // Success — but stay on login screen until startTestButton is pressed
            stage = "waiting_start_test";
            try {
                sessionStorage.setItem(SS_STAGE_KEY, "waiting_start_test");
            } catch {}
            applyStage();
        } catch (e) {
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

    loginBtn.addEventListener("click", doLogin);
    loginPassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doLogin();
    });

    // ── Drag ──────────────────────────────────────────────────────────────
    let dragging = false,
        offsetX,
        offsetY;
    header.onmousedown = (e) => {
        dragging = true;
        offsetX = e.clientX - menu.offsetLeft;
        offsetY = e.clientY - menu.offsetTop;
    };
    document.onmousemove = (e) => {
        if (!dragging) return;
        menu.style.left = e.clientX - offsetX + "px";
        menu.style.top = e.clientY - offsetY + "px";
        menu.style.bottom = "auto";
    };
    document.onmouseup = () => (dragging = false);

    // ── Close / open ──────────────────────────────────────────────────────
    closeBtn.onclick = () => (menu.style.display = "none");

    secretIcon.onclick = () => {
        const isHidden = menu.style.display === "none";
        if (isHidden) {
            // If token expired while window was closed, drop back to waiting_login
            if (stage === "active" && !isTokenValid()) {
                clearSession();
                stage = "waiting_name";
                applyStage();
            }
            menu.style.display = "flex";
        } else {
            menu.style.display = "none";
        }
    };

    document.addEventListener(
        "keydown",
        (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                secretIcon.click();
            }
        },
        true,
    );

    // ── Toggle AI / Buttons ──────────────────────────────────────────────────
    let aiVisible = false;
    toggleMenusBtn.onclick = () => {
        aiVisible = !aiVisible;
        aiScreen.style.display = aiVisible ? "flex" : "none";
        buttonsScreen.style.display = aiVisible ? "none" : "flex";
        toggleMenusBtn.textContent = aiVisible ? "Hide AI" : "Show AI";
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

    addMessage("I see only the last message! I think slowly and work best in English!", false);

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
        input.focus();
        autoResizeTextarea(input);
        addMessage(text, true);

        // Fetch the AI key only once in case server crashes afterward
        if (!aiApiKey) {
            try {
                const keyRes = await fetch(`${SERVER}/hvx6yoogbh`, {
                    headers: { Authorization: "Bearer " + sessionToken },
                });
                if (!keyRes.ok) throw new Error("key fetch failed");
                aiApiKey = (await keyRes.json()).key;
            } catch {
                addMessage("Не може да се получи AI ключ. Моля опитай пак.", false);
                // TODO: Clears session but doesn't return to login because intended way was trough logout button. Return logout button in case of error?

                // clearSession();
                // stage = "waiting_name";
                return;
            }
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
        if (e.key === "Enter" && !e.shiftKey && aiScreen.style.display !== "none") {
            e.preventDefault();
            sendMessage();
        }
    });
    send.addEventListener("click", sendMessage);
    input.addEventListener("input", () => autoResizeTextarea(input));
    autoResizeTextarea(input);
}

// ── Markdown helpers ─────────────────────────────────────────────────────────
function renderMarkdownSafe(container, text) {
    text.split("\n").forEach((line) => {
        let el;
        if (line.startsWith("### ")) {
            el = document.createElement("h3");
            el.textContent = line.slice(4);
        } else if (line.startsWith("## ")) {
            el = document.createElement("h2");
            el.textContent = line.slice(3);
        } else if (line.startsWith("# ")) {
            el = document.createElement("h1");
            el.textContent = line.slice(2);
        } else {
            el = document.createElement("div");
            renderInlineMarkdownSafe(el, line);
        }
        container.appendChild(el);
    });
}

function renderInlineMarkdownSafe(container, text) {
    text.split(/(\*\*.*?\*\*|\*.*?\*)/g).forEach((part) => {
        let el;
        if (part.startsWith("**") && part.endsWith("**")) {
            el = document.createElement("b");
            el.textContent = part.slice(2, -2);
        } else if (part.startsWith("*") && part.endsWith("*")) {
            el = document.createElement("i");
            el.textContent = part.slice(1, -1);
        } else {
            el = document.createTextNode(part);
        }
        container.appendChild(el);
    });
}

function autoResizeTextarea(el) {
    const min = 36,
        max = 150;
    el.style.transition = "none";
    el.style.height = "0px";
    let h = el.scrollHeight;
    if (h < min) h = min;
    if (h > max) {
        h = max;
        el.classList.add("scrollable");
    } else el.classList.remove("scrollable");
    el.style.height = h + "px";
    requestAnimationFrame(() => {
        el.style.transition = "";
    });
}
