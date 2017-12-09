'use strict';

/*eslint no-undef:0,no-console:0*/

var chai = require('chai');

chai.should();

var DFS = require('../index.js');

describe('Тестирование data2serial', function() {
  it('должен быть класс DataFromSerial', function() {
    DFS.should.be.a('function');
  });

  it('в классе DataFromSerial должен быть метод searchDev', function () {
    DFS.should.be.have.property('searchDev');
    DFS.searchDev.should.be.a('function');
  });

  describe('#searchDev', function() {
    this.timeout(25000);

    it('должна находить девайс', function(done) {
      DFS.searchDev(9600).then(()=>{
        // device = new DFS(port, 9200);
        done();
      },
      err=>{
        console.log('девайс не найден: %s', err);
        done(err);
      });
    });
  });
});
