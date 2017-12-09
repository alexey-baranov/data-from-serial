'use strict';

/*eslint no-console:0*/
/*eslint no-case-declarations:0*/

var DFS = require('./index.js');

//var dfs = new DFS('COM20', 9600);
// dfs.on('pin_changed', (pinNum, value)=>{
//   console.log('Изменился ПИН №%s, состояние=%s', pinNum, value);
// });

DFS.searchDev(9600).then(port=>{
  console.log('Device found on: %s', port);

  let dfs = new DFS(port, 9600);
  
  //при изменении состояния приходит событие
  dfs.on('pin_changed', (pinNum, value)=>{
    console.log('Изменился ПИН №%s, значение=%s', pinNum, value);
  });
},
(err)=>{
  console.log('Device not found: %s', err);
});



