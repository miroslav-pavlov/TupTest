// menu.js
function createFloatingMenu() {
    const CONFIG = {
        apiKey: "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",
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
    };

    const secretIcon = document.createElement("div");
    secretIcon.id = "secret-icon";
    document.body.appendChild(secretIcon);

    const windowEl = document.createElement("div");
    windowEl.id = "tt-window";
    windowEl.style.display = "none";
    document.body.appendChild(windowEl);

    // ── Header ──────────────────────────────────────────────────
    const header = document.createElement("div");
    header.id = "tt-header";

    const title = document.createElement("div");
    title.textContent = "ТъпТест";

    const closeBtn = document.createElement("div");
    closeBtn.id = "tt-close";
    closeBtn.textContent = "✕";

    header.appendChild(title);
    header.appendChild(closeBtn);
    windowEl.appendChild(header);

    // ── Content ──────────────────────────────────────────────────
    const content = document.createElement("div");
    content.id = "tt-content";
    windowEl.appendChild(content);

    // ── Chat screen ──────────────────────────────────────────────
    const ttScreen = document.createElement("div");
    ttScreen.id = "tt-screen";
    ttScreen.className = "tt-screen";
    ttScreen.style.display = "none";
    content.appendChild(ttScreen);

    const messages = document.createElement("div");
    messages.id = "tt-messages";
    ttScreen.appendChild(messages);

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
    ttScreen.appendChild(inputArea);

    // ── Menu screen ──────────────────────────────────────────────
    const menuScreen = document.createElement("div");
    menuScreen.id = "menu-screen";
    menuScreen.className = "tt-screen";
    menuScreen.style.display = "flex";
    content.appendChild(menuScreen);

    // Status badges
    const statusRow = document.createElement("div");
    statusRow.className = "tt-status-row";

    const badge1 = document.createElement("div");
    badge1.className = "tt-badge";
    badge1.textContent = "Bypass ON";

    const badge2 = document.createElement("div");
    badge2.className = "tt-badge";
    badge2.textContent = "Timer OFF";

    statusRow.appendChild(badge1);
    statusRow.appendChild(badge2);
    menuScreen.appendChild(statusRow);

    // Section label
    const sectionLabel = document.createElement("div");
    sectionLabel.className = "tt-section-label";
    sectionLabel.textContent = "Actions";
    menuScreen.appendChild(sectionLabel);

    // Buttons
    const btnFullscreen = document.createElement("button");
    btnFullscreen.textContent = "Toggle Fullscreen";
    btnFullscreen.className = "tt-button";
    btnFullscreen.id = "btn-fullscreen";
    menuScreen.appendChild(btnFullscreen);

    const btnBack = document.createElement("button");
    btnBack.textContent = "Предишен въпрос";
    btnBack.className = "tt-button";
    btnBack.id = "btn-back";
    menuScreen.appendChild(btnBack);

    const btnCopy = document.createElement("button");
    btnCopy.textContent = "Копирай въпрос/и\n( Поддържа снимки )";
    btnCopy.className = "tt-button";
    btnCopy.id = "btn-copy";
    menuScreen.appendChild(btnCopy);

    const btnAskAI = document.createElement("button");
    btnAskAI.textContent = "Попитай AI\n( Не поддържа снимки )";
    btnAskAI.className = "tt-button";
    btnAskAI.id = "btn-ask-ai";
    menuScreen.appendChild(btnAskAI);

    // ── Toggle button ────────────────────────────────────────────
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "tt-toggle";
    toggleBtn.textContent = "Show AI";
    windowEl.appendChild(toggleBtn);

    // ── Drag ─────────────────────────────────────────────────────
    let dragging = false;
    let offsetX, offsetY;

    header.onmousedown = (e) => {
        dragging = true;
        offsetX = e.clientX - windowEl.offsetLeft;
        offsetY = e.clientY - windowEl.offsetTop;
    };

    document.onmousemove = (e) => {
        if (!dragging) return;
        windowEl.style.left = e.clientX - offsetX + "px";
        windowEl.style.top = e.clientY - offsetY + "px";
        windowEl.style.bottom = "auto";
    };

    document.onmouseup = () => (dragging = false);

    // ── Close / open ─────────────────────────────────────────────
    closeBtn.onclick = () => (windowEl.style.display = "none");

    secretIcon.onclick = () => {
        const isHidden = windowEl.style.display == "none";
        windowEl.style.display = isHidden ? "flex" : "none";
    };

    let ttVisible = false;

    toggleBtn.onclick = () => {
        ttVisible = !ttVisible;
        ttScreen.style.display = ttVisible ? "flex" : "none";
        menuScreen.style.display = ttVisible ? "none" : "flex";
        toggleBtn.textContent = ttVisible ? "Hide AI" : "Show AI";
    };

    // ── Messages ─────────────────────────────────────────────────
    function addMessage(text, isUser) {
        const msgPosition = document.createElement("div");
        const msg = document.createElement("div");

        msg.className = "tt-msg " + (isUser ? "tt-user" : "tt-bot");
        msgPosition.className = isUser ? "tt-user-position" : "tt-bot-position";

        renderMarkdownSafe(msg, text);

        msgPosition.appendChild(msg);
        messages.appendChild(msgPosition);
        messages.scrollTop = messages.scrollHeight;
    }

    addMessage("I see only the last message! I think slowly and work best in English!", false);

    // ── Send / stream ─────────────────────────────────────────────
    async function sendMessage(textOverride = null) {
        let raw = textOverride;
        if (raw instanceof Event) raw = null;

        const text = (raw ?? input.value ?? "").toString().trim();
        if (!text) return;

        input.value = "";
        input.focus();
        autoResizeTextarea(input);

        addMessage(text, true);

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + CONFIG.apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: CONFIG.model,
                messages: [{ role: "user", content: text }],
                stream: true,
            }),
        });

        const msgPosition = document.createElement("div");
        const msg = document.createElement("div");

        msg.className = "tt-msg tt-bot";
        msgPosition.className = "tt-bot-position";
        msg.textContent = "Thinking…";

        msgPosition.appendChild(msg);
        messages.appendChild(msgPosition);

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let fullText = "";
        let hasStarted = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data:")) continue;

                const jsonStr = line.slice(5).trim();
                if (jsonStr === "[DONE]") return;

                try {
                    const json = JSON.parse(jsonStr);
                    const token = json.choices?.[0]?.delta?.content || "";

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

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey && ttScreen.style.display !== "none") {
            e.preventDefault();
            sendMessage();
        }
    });

    send.addEventListener("click", sendMessage);
    input.addEventListener("input", () => autoResizeTextarea(input));
    autoResizeTextarea(input);
}

// ── Markdown helpers ──────────────────────────────────────────────

function renderMarkdownSafe(container, text) {
    const lines = text.split("\n");

    lines.forEach((line) => {
        let element;

        if (line.startsWith("### ")) {
            element = document.createElement("h3");
            element.textContent = line.slice(4);
        } else if (line.startsWith("## ")) {
            element = document.createElement("h2");
            element.textContent = line.slice(3);
        } else if (line.startsWith("# ")) {
            element = document.createElement("h1");
            element.textContent = line.slice(2);
        } else {
            element = document.createElement("div");
            renderInlineMarkdownSafe(element, line);
        }

        container.appendChild(element);
    });
}

function renderInlineMarkdownSafe(container, text) {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    parts.forEach((part) => {
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
    const minHeight = 36;
    const maxHeight = 150;

    el.style.transition = "none";
    el.style.height = "0px";

    let newHeight = el.scrollHeight;
    if (newHeight < minHeight) newHeight = minHeight;

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        el.classList.add("scrollable");
    } else {
        el.classList.remove("scrollable");
    }

    el.style.height = newHeight + "px";

    requestAnimationFrame(() => {
        el.style.transition = "";
    });
}
