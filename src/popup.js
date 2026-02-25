// popup.js

// Edge Mobile centering fix
if (window.innerWidth > 320 || window.innerHeight > 600) {
    document.documentElement.classList.add("tt-mobile-center");
    document.body.classList.add("tt-mobile-center");
}

const SERVER = "https://h.tuptest.xyz";

const statusBox = document.getElementById("status-box");

function setStatus(lines, type = "") {
    statusBox.innerHTML = "";
    statusBox.className = type;
    lines.forEach((line, i) => {
        const div = document.createElement("div");
        div.textContent = line;
        if (i > 0) div.style.marginTop = "3px";
        statusBox.appendChild(div);
    });
}

document.getElementById("btn-check-subscription").addEventListener("click", async () => {
    const username = document.getElementById("input-username").value.trim();
    const password = document.getElementById("input-password").value.trim();

    if (!username || !password) {
        setStatus(["✗ Моля въведи потребителско име и парола."], "error");
        return;
    }

    setStatus(["Проверка на абонамент..."]);
    try {
        const res = await fetch(`${SERVER}/amx1229ko4`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!data.found) {
            setStatus(["✗ Потребителят не е намерен."], "error");
            return;
        }

        const lines = [`✓ Намерен потребител:`, `${data.full_name_cyrillic}`, `(${data.full_name_latin})`];

        if (data.subscription_active) {
            const expiry = new Date(data.expires_on).toLocaleDateString("bg-BG");
            lines.push(`✓ Aктивен до ${expiry}`);
            setStatus(lines, "success");
        } else {
            lines.push("✗ Абонаментът не е активен.");
            setStatus(lines, "error");
        }
    } catch (e) {
        setStatus(["✗ Проблем с връзката към сървъра."], "error");
    }
});

document.getElementById("btn-check-connection").addEventListener("click", async () => {
    setStatus(["Проверяване на връзка..."]);
    try {
        const res = await fetch(`${SERVER}/3rlhmqxjoh/`);
        if (res.ok) {
            setStatus(["✓ Сървърът е на линия."], "success");
        } else {
            setStatus(["✗ Грешка със сървъра: " + res.status], "error");
        }
    } catch (e) {
        setStatus(["✗ Сървърът не е на линия."], "error");
    }
});
