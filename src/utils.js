// utils.js
function numberToLetter(num) {
    if (num >= 1 && num <= 26) return String.fromCharCode(96 + num);
    return num;
}

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


