DataFromSerial
===

Модуль для получения данных с Arduino по самопальному протоколу

Установка
======

...

Использование
======

```js
var DFS = require ('data_from_serial');

/* Модуль поддерживает поиск девайса, вызовом статического метода searchDev. 
Метод выполняется асинхронно, результат возвращается промисом (Promise) */
DFS.searchDev(9600).then(port=>{
  dfs = new DFS(port, 9600);

  //при изменении состояния приходит событие
  dfs.on('pin', (pinNum, value)=>{
    console.log('Изменился ПИН №%s, состояние=%s', pinNum, value);
  });
},
(err)=>{
  console.log('Device not found: %s', err);
});
```

События:
------

```js
on('pin', (pinNumber, newState)=>{...});
```
возникает при смене состояния, где newState - boolean

