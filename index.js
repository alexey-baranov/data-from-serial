'use strict';

/*eslint */

const EventEmitter = require('events'),
      SearchDevice = require('./searchdev.js'),
      winston = require('winston'),
      SerialPort = require('serialport');

const BAUDRATE = 9600,
      TIMER = 10000;

class DataFromSerial extends EventEmitter {

  constructor(port, baudrate){
    super();
    this.logger = winston.loggers.get('TERMINAL_DEVICE');
    this.portName = port;
    this.baudrate = baudrate || BAUDRATE;
    this.active = false;
    this.incomingBuf = [];
    this.oldPins = {};
    setInterval(this.onTimer.bind(this), TIMER);
    this.onTimer();
  }

  Array2Hex(Arr){
    let res='';
    for(let i=0;i<Arr.length;i++) res += ' '+Arr[i].toString(16);
    return res;}
  
  checkBuf(){
    if(this.incomingBuf[0]!=0x55) this.incomingBuf.length = 0;
    if(this.incomingBuf.length>1 && this.incomingBuf[1]!=0xaa) this.incomingBuf.length = 0;
    if (this.incomingBuf.length > 4 && this.incomingBuf[2]+4==this.incomingBuf.length) {
      try{
        let CRC = 0;
        for(let i=0;i<this.incomingBuf.length-1;i++) CRC ^= this.incomingBuf[i];
        if (this.incomingBuf[this.incomingBuf.length-1] == CRC) {
          //this.logger.debug('R'+this.Array2Hex(this.incomingBuf));
          for(let i=0;i<this.incomingBuf[2];i+=2){
            let pinNum = this.incomingBuf[3+i],
                pinValue = this.incomingBuf[4+i];

            if(this.oldPins[pinNum]==undefined) this.oldPins[pinNum]=0;
                
            if(this.oldPins[pinNum]!=pinValue){
              this.emit('pin_changed', pinNum, pinValue);
              this.oldPins[pinNum]=pinValue;
            }
          }
        }
      }finally{this.incomingBuf.length = 0;}
    }
  }

  onTimer(){
    if(!this.active){
      this.port = new SerialPort(this.portName, {baudrate: this.baudrate}, (error)=>{
        if(error){
          this.logger.warn('error on open port %s: %s', this.portName, error);
        }else{
          this.logger.warn('success open port %s', this.portName);
          this.active = true;

          this.port.on('data', (data)=>{
            let packet = new Uint8Array( data );
            for(let i=0;i<packet.length;i++){
              this.incomingBuf.push(packet[i]);
              this.checkBuf();
            }
          });

          this.port.on('close', ()=>{
            this.port = null;
            this.active = false;
          });

          this.port.on('disconnect', (err)=>{
            this.logger.info('"disconnect" event detected: %s', err);
            this.active = false;
          });
        }
      });
    }
  }

  static searchDev(baudRate){
    return new Promise(function (resolve, reject){
      SearchDevice({baudrate: parseInt(baudRate || BAUDRATE)}, function(err, res){
        if(err) reject(err);
        else resolve(res);
      });    
    });
  }
}
  
module.exports = DataFromSerial;
