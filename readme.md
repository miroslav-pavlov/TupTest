<p align="center">
  <img align="center" alt="logo" src="https://www.smartest.bg/favicon.ico">
</p>  

# ТъпТест - инструменти за преписване в СмарТест  
<p align="center" height="30%">
<video src="https://github.com/user-attachments/assets/3a298ed6-e100-4c7e-a5f6-7bdea38708b3" height="30%" controls></video>
</p>  

---  
### 📑 Бързи връзки

- [Изтегляне](#-изтегляне)
- [Функции](#-функции)
- [Използване](#-използване)
- [Въпроси](#-въпроси)
- [Разработване](#-разработване)
---
## 📦 Изтегляне
### 🖥️ На компютър
1. Изтегляш **Tampermonkey**:  
- За **Chrome** и **Edge**: [Изтегляш **Tampermonkey**](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).  
- За **Firefox**: [Изтегляш **Tampermonkey**](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).
2. Позволяваш да върви в **Incognito**:
- За **Chrome** и **Edge**: Горе дясно > бутонът Extensions > трите точки на **Tampermonkey** > Manage Extension > **Allow User Scripts: ON** и **Allow in Incognito: ON**.
- За **Firefox**: Горе дясно > бутонът Extensions > зъбното колело на **Tampermonkey** > Manage Extension > **Run in Private Windows: ON**.
3. [Изтегляш **ТъпТест**](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js). 
4. Готов си! Прочети по-долу как да го използваш.
### 🟢️ На Android
1. Изтегляш **[Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox)** или **[Edge](https://play.google.com/store/apps/details?id=com.microsoft.emmx)**. (**Chrome не става!**)
2. Изтегляш **Tampermonkey**:
- За **Firefox**: Трите точки > Extensions > изтегляш **Tampermonkey**.
- За **Edge**: Трите черти > Extensions > Manage Extensions > изтегляш **Tampermonkey**.
3. Позволяваш да върви в **Incognito**:
- За **Firefox**: Трите точки > Extensions > трите точки на **Tampermonkey** > **Run in private browsing: ON**.
- За **Edge**: Трите черти > Extensions > Manage Extensions > трите точки на **Tampermonkey** “ **Allow User Scripts: ON** и **Рun InPrivate: ON**.
4. [Изтегляш **ТъпТест**](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js).  
5. Готов си! Прочети по-долу как да го използваш.
### 🍎️ На iPhone
1. В AppStore-a **купуваш Tampermonkey** за **3€**. Ако не искаш да плащаш си вземи **Android**. Няма друг начин за iPhone :(
2. В настройките на телефона си се ориентирай до Tampermonkey и в неговите настройки иму позволи да работи в инкогнито. 
3. [Изтегляш **ТъпТест**](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js).  
4. Готов си! Прочети по-долу как да го използваш.
---
## ✨ Функции
- Бутон за връщане към предишен въпрос
- Бутон за копиране на въпросите (за да пращаш на AI)
- Спиране на таймерите на въпросите (но таймера на теста продължава да тече!)
- Напускане на цял екран
- Напускане на приложението
- Спиране на изпращането на теста при затваряне на таба
> - История на тестовете (планирано)
---
## 🫱 Използване
1. В браузъра си отиваш на **https://tuptest.bg/izpit** и пишеш кода си за теста.
2. Натискаш **иконката на СмарТест** или бутона на клавиатурата **TAB** за да отвориш менюто.
3. Преписваш. Прочети [Функции](#функции) за да знаеш какво можеш да правиш.
---
## ❓ Въпроси
Ако въпросът ти не е отговорен по-долу го задай в секцията **Issues** (горе ляво на този сайт).
1. **Защо Tampermonkey?** Защото е единствения начин да върви и на iPhone. Иначе можеше да бъде extension и да не поддържа iPhone-а.
---
## 🔧 Разработване
1. Изтегляш [Node.js и NPM](https://nodejs.org).
2. Изтегляш нужните пакети:
```bash
npm install
```
3. Локално тестване.
- В кода на **Tampermonkey** включи **`isDev`**.
```bash
npm run dev
```
4. Строиш проекта за качване на Release. (Файловете са в папката **build/***)
```bash
npm run build
```


