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

    const screenButtons = document.createElement("div");
    screenButtons.id = "buttons-screen";
    screenButtons.className = "tt-screen";
    screenButtons.style.display = "flex";
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
    btnFullscreen.textContent = "Направи на цял екран";
    btnFullscreen.className = "tt-button";
    btnFullscreen.id = "btn-fullscreen";
    screenButtons.appendChild(btnFullscreen);

    const btnBack = document.createElement("button");
    btnBack.textContent = "Предишен въпрос";
    btnBack.className = "tt-button";
    btnBack.id = "btn-back";
    screenButtons.appendChild(btnBack);

    const btnCopy = document.createElement("button");
    btnCopy.textContent = "Копирай въпроси";
    btnCopy.className = "tt-button";
    btnCopy.id = "btn-copy";
    screenButtons.appendChild(btnCopy);

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
        menu.style.display = menu.style.display === "none" ? "flex" : "none";
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
}