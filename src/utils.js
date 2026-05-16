// utils.js
function numberToLetter(num) {
    if (num >= 1 && num <= 26) return String.fromCharCode(96 + num);
    return num;
}