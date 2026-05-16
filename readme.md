# ТъпТест
Инструменти за сайта https://smartest.bg/
## Функции на ТъпТест
- Бутон за копиране на въпросите (за да пращаш на AI)
- Спира таймерите на въпросите (таймера на теста продължава да тече!)
- Връщане на предишни въпроси
- Напускане на fullscreen
- Преоразмеряване на екрана
- Ако не искаш да правиш теста просто затвори прозореца
> - Позволява refresh-ване на страницата (планирано)
> - Безкрайни червени екрани в случай че някакси се появят (счупено)
## Как да изтеглиш:
### За компютър 🖥️
1. Изтегляш Tampermonkey:  
За **Chrome** и **Edge** от [тук](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).  
За **Firefox** от [тук](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/).

2. Трябва ръчно да позволиш на Tampermonkey да работи и в инкогнито! Във Firefox oтиди в extensions tab-а на браузъра си и на трите точки на Tampermonkey избери manage и след това тикчето за инкогнито.  
3. Изтегляш ТъпТест от [тук](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js).
4. Готов си! Прочети по-долу как да го използваш.
### За Android 🟢️
1. Изтегляш приложението на Firefox или Edge. **Chrome не става!**
  
2. В избраното приложение в секция Extensions (намери го сам) търсиш и инсталираш **Tampermonkey**.
3. Трябва ръчно да позволиш на Tampermonkey да работи и в инкогнито! Отиди в extensions tab-а на браузъра си и на трите точки на Tampermonkey избери manage и след това тикчето за инкогнито. 
4. Изтегляш ТъпТест от [тук](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js).  
5. Готов си! Прочети по-долу как да го използваш.
### За iPhone 🍎️
1. В AppStore-a **купуваш Tampermonkey** за **3€**. Ако не искаш да плащаш си вземи **Android**. Няма друг начин за iPhone :(
  
2. Трябва ръчно да позволиш на Tampermonkey да работи и в инкогнито! В настройките на телефона си се ориентирай до Tampermonkey и в неговите настройки избери тикчето за инкогнито. 
3. Изтегляш ТъпТест от [тук](https://raw.githubusercontent.com/miroslav-pavlov/TupTest/tampermonkey-userscript/tuptest.user.js).  
4. Готов си! Прочети по-долу как да го използваш.

## Как да използваш
1. В браузъра си отидаш на https://tuptest.bg/izpit (на изуст запомняш линка) и пишеш кода си за теста.
2. След като си напишеш името натискаш иконката на СмарТест или бутона на клавиатурата TAB за да отвориш менюто.
3. Стартираш си теста и се кефиш. 👍️

## Имаш въпроси?
Ако въпросът ти не е отговорен по-долу ме питай в секцията **Issues** (горе ляво).
1. **Защо Tampermonkey?** Защото е единствения общ начин да върви и на компютър, и на Android, и на iPhone. Иначе можех да изключа iPhone-а и да направя extension.
## Как да го подкараш сам
1. Трябват ти **Node.js** и **NPM** изтеглени
 
1.  Инсталираш нужните пакети:
```
npm install
```

-  Строиш проекта. Файловете са в папката **build/***
```
npm run build
```
-  Строиш проекта + рънваш сървъра за Tampermonkey. Файловете са в папката **build/***
```
npm run dev
```
(Сървъра е за локално тестване на Tampermonkey)

