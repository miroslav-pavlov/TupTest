// ui.js
function createMenu(isOnMobile = false) {
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

    const content = document.createElement("div");
    content.id = "tt-content";
    menu.appendChild(content);

    const screenLogin = document.createElement("div");
    screenLogin.id = "login-screen";
    screenLogin.className = "tt-screen";
    screenLogin.style.display = "flex";
    content.appendChild(screenLogin);

    const loginInner = document.createElement("div");
    loginInner.id = "login-inner";
    screenLogin.appendChild(loginInner);

    if (!isOnMobile) {
        const tipTab = document.createElement("div");
        tipTab.id = "tab-hint";
        tipTab.className = "tt-tip-login-base tt-tip-login-waiting";
        tipTab.textContent = "С бутона TAB можеш да скриеш менюто.";
        loginInner.appendChild(tipTab);
    }

    const tipLoginHint = document.createElement("div");
    tipLoginHint.id = "login-hint";
    tipLoginHint.className = "tt-tip-login-warning";
    loginInner.appendChild(tipLoginHint);

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

    const screenAI = document.createElement("div");
    screenAI.id = "tt-screen";
    screenAI.className = "tt-screen";
    screenAI.style.display = "none";
    content.appendChild(screenAI);

    const messages = document.createElement("div");
    messages.id = "tt-messages";
    screenAI.appendChild(messages);

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
    screenAI.appendChild(inputArea);

    const screenButtons = document.createElement("div");
    screenButtons.id = "buttons-screen";
    screenButtons.className = "tt-screen";
    screenButtons.style.display = "none";
    content.appendChild(screenButtons);

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
    screenButtons.appendChild(badgesRow);

    const sectionLabel = document.createElement("div");
    sectionLabel.className = "tt-section-label";
    sectionLabel.textContent = "Действия";
    screenButtons.appendChild(sectionLabel);

    const submitNotice = document.createElement("div");
    submitNotice.className = "tt-tip-login-base tt-tip-login-waiting";
    submitNotice.textContent = "Затвори таба, ако искаш да спреш изпращането на теста.";
    screenButtons.appendChild(submitNotice);

    const btnFullscreen = document.createElement("button");
    btnFullscreen.textContent = "Toggle Fullscreen";
    btnFullscreen.className = "tt-button";
    btnFullscreen.id = "btn-fullscreen";
    screenButtons.appendChild(btnFullscreen);

    const btnBack = document.createElement("button");
    btnBack.textContent = "Предишен въпрос";
    btnBack.className = "tt-button";
    btnBack.id = "btn-back";
    screenButtons.appendChild(btnBack);

    const btnCopy = document.createElement("button");
    btnCopy.textContent = "Копирай въпрос/и\n( Поддържа снимки )";
    btnCopy.className = "tt-button";
    btnCopy.id = "btn-copy";
    screenButtons.appendChild(btnCopy);

    const btnAskAI = document.createElement("button");
    btnAskAI.textContent = "Попитай AI\n( Не поддържа снимки )";
    btnAskAI.className = "tt-button";
    btnAskAI.id = "btn-ask-ai";
    screenButtons.appendChild(btnAskAI);

    const toggleMenusBtn = document.createElement("button");
    toggleMenusBtn.id = "tt-toggle";
    toggleMenusBtn.style.display = "none";
    toggleMenusBtn.textContent = "Покажи AI";
    menu.appendChild(toggleMenusBtn);

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
        // const isHidden = menu.style.display === "none";
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
        screenAI.style.display = aiVisible ? "flex" : "none";
        screenButtons.style.display = aiVisible ? "none" : "flex";
        toggleMenusBtn.textContent = aiVisible ? "Скрий AI" : "Покажи AI";
        if (aiVisible && !window.ttIsOnMobile) {
            input.focus();
        } else {
            document.activeElement?.blur();
        }
    };

    return {
        // Root elements
        secretIcon,
        menu,

        // Screens
        loginScreen: screenLogin,
        aiScreen: screenAI,
        buttonsScreen: screenButtons,

        // Login screen elements
        loginInner,
        tipTab,
        tipLoginHint,
        loginTitle,
        loginUsername,
        loginPassword,
        loginError,
        loginBtn,

        // AI screen elements
        messages,
        inputArea,
        input,
        send,

        // Buttons screen elements
        badgesRow,
        badge1,
        badge2,
        badge3,
        badge4,
        sectionLabel,
        submitNotice,
        btnFullscreen,
        btnBack,
        btnCopy,
        btnAskAI,

        // Header
        header,
        title,
        closeBtn,
        toggleMenusBtn,
    };
}
