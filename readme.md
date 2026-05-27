<p align="center">
  <img width="100px" alt="tuptest" src="https://github.com/user-attachments/assets/9d8e92f1-f8d3-4689-a3ad-af9019f3c1e0" />
</p>  
<h1 align="center">ТъпТест - инструмент за преписване в СмарТест</h1>
<details>
<summary><h3>Демо видео (натисни за да видиш)</h3></summary>
<video src="https://github.com/user-attachments/assets/3a298ed6-e100-4c7e-a5f6-7bdea38708b3" height="15%" controls></video>
</details>  

---  

### 📑 Бързи връзки

- [Изтегляне](#-изтегляне)
- [Използване](#-използване)
- [Функции](#-функции)
- [Въпроси](#-въпроси)
- [Разработване](#-разработване)
---
## 📦 Изтегляне
### 🟢️ За Android
1. Изтегляш [**Firefox** от тук](https://play.google.com/store/apps/details?id=org.mozilla.firefox) или [**Edge** от тук](https://play.google.com/store/apps/details?id=com.microsoft.emmx). (**Chrome не става!**)
2. Изтегляш **Tampermonkey**:
- За **Firefox**: Трите точки > Extensions > изтегляш **Tampermonkey**.
- За **Edge**: Трите черти > Extensions > Manage Extensions > изтегляш **Tampermonkey**.
3. Позволяваш да върви в **Incognito**:
- За **Firefox**: Трите точки > Extensions > трите точки на **Tampermonkey** > **Run in private browsing: ON**.
- За **Edge**: Трите черти > Extensions > Manage Extensions > трите точки на **Tampermonkey** “ **Allow User Scripts: ON** и **Рun InPrivate: ON**.
4. [Изтегляш **ТъпТест** от тук](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js). (Отварящ линка във **Firefox** или **Edge**.)  
5. Готов си! Прочети по-долу как да го използваш.
### 🍎️ За iPhone
1. В AppStore-a **купуваш Tampermonkey** за **3€**. Ако не искаш да плащаш си вземи **Android**. Няма друг начин за iPhone :(
2. В настройките на телефона си се ориентирай до Tampermonkey и в неговите настройки иму позволи да работи в инкогнито. 
3. [Изтегляш **ТъпТест** от тук](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js).  
4. Готов си! Прочети по-долу как да го използваш.
### 🖥️ За компютър
1. Изтегляш **Tampermonkey**:  
- За **Chrome** и **Edge**: [Изтегляш **Tampermonkey** от тук](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).  
- За **Firefox**: [Изтегляш **Tampermonkey** от тук](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).
2. Позволяваш да върви в **Incognito**:
- За **Chrome** и **Edge**: Горе дясно на браузъра > бутонът Extensions > трите точки на **Tampermonkey** > Manage Extension > **Allow User Scripts: ON** и **Allow in Incognito: ON**.
- За **Firefox**: Горе дясно на  браузъра > бутонът Extensions > зъбното колело на **Tampermonkey** > Manage Extension > **Run in Private Windows: ON**.
3. [Изтегляш **ТъпТест** от тук](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js). 
4. Готов си! Прочети по-долу как да го използваш.
---
## 🫱 Използване
1. В браузъра си (Firefox или Edge на Android) отиваш на **https://tuptest.bg/izpit** и пишеш кода си за теста и натискаш започни.
3. Натискаш **логото на СмарТест** най-отгоре на сайта или бутона на клавиатурата **TAB** (на компютър) за да отвориш менюто.
4. Преписваш. Прочети [Функции](#-функции) за да знаеш какво ТъпТест може да прави.
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
## ❓ Въпроси
Ако въпросът ти не е отговорен по-долу го задай в секцията **Issues** (горе ляво на този сайт).
1. **Как да си видя върнатия си тест?** Ако си го предал/а от инкогнито, не можеш. Ако си го предал/а извън инкогнито, въведи отново кода на теста в https://tuptest.bg/izpit или отвори линка където си го правил/а от историята на браузъра.
2. **Защо Tampermonkey?** Защото е единственият начин да върви и на iPhone. Иначе можеше да бъде extension и да не поддържа iPhone-а.
---
## 🔧 Разработване
1. Изтегляш [Node.js и NPM](https://nodejs.org).
2. Изтегляш нужните пакети:
```bash
npm install
```
3. Локално тестване.
- В кода на **Tampermonkey** включи **`isDev`** и в конзолата на твоето IDE:
```bash
npm run dev
```
4. Строиш проекта за качване на Release. (Файловете са в папката **build/***)
```bash
npm run build
```


