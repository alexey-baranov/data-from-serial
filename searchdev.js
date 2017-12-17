'use strict';

let logger = winston.loggers.get('Arduino')
const SerialPort = require('serialport');

/**
 * Send on single port command from <aSend>, wait response and compare answer with <aWait>
 * on error or timeout return RESOLVE
 * on OK return REJECT
 *
 * @param {Object} portInfo Item of port list
 */
async function checkDevice(portInfo, oOptions) {
  var baudrate = oOptions.baudrate || 9600,
      incomingBuf = [],
      result = null,
      port = new SerialPort(portInfo.comName, {baudrate});

  logger.info('check port: %s',portInfo.comName);

  try{
    /**
     * промис возвращает ошибку если все плохо или ничего если порт нашелся
     */
    await Promise.race([
      new Promise((resolve, reject) => {
        //девайс шлет инфу каждую сек
        setTimeout(() => {
          reject(new Error('timeout ' + portInfo.comName));
        }, 2500);
      }),
      new Promise((resolve, reject) => {
        port.on('error', (error) => {
          reject(error);
        });

        port.on('data', (data) => {
          let packet = new Uint8Array(data);

          for (let i = 0; i < packet.length; i++) {
            logger.log('  data: %s',packet[i]);
            incomingBuf.push(packet[i]);
            if(incomingBuf[0]!=0x55) incomingBuf.length = 0;
            if(incomingBuf.length>1 && incomingBuf[1]!=0xaa) incomingBuf.length = 0;
          }

          //<55><AA><LEN><DATA><CRC>
          if (incomingBuf.length > 4 && incomingBuf[2]+4==incomingBuf.length) {
            let CRC = 0;
            for(let i=0;i<incomingBuf.length-1;i++) CRC ^= incomingBuf[i];
            if (incomingBuf[incomingBuf.length-1] == CRC) {
              resolve();
            }
            else {
              reject(new Error(`port on data invalid answer ${portInfo.comName} ${incomingBuf}`));
            }
          }
        });
      })
    ]);
  }
  catch (err) {
    //logger.warn(err)
    result = err;
  }

  /**
  * в конце закрыл порт если он открыт и вернул result
  */
  finally {
    return new Promise((resolve, reject) => {
      if (port.isOpen()) {
        port.close((error) => {
          if (error) {
            //logger.error("port on close error", portInfo.comName, error)
            reject(result || error);
          }
          port = null;
          if (!result) {
            //logger.info("success check", portInfo.comName)
            resolve();
          }
          else {
            reject(result);
          }
        })
      }
      else {
        port = null;
        reject(result || new Error('lost port', portInfo.comName));
      }
    })
  }
}

/**
 * Search device on all available ports
 *
 * @param \{{{Object}}\} {{oOptions}} {{параметры открытия порта: baudrate...}}{{}}
 * @param {Function} callback function(err [, portName])
 */
let searchDev = function (oOptions, callback) {
  oOptions = oOptions || {};

  SerialPort.list(async (err, ports) => {
    if (err) {
      //logger.info('searchDev: device not found')
      callback(err);
    }
    else {
      for (let portItem of ports) {
        try {
          await checkDevice(portItem, oOptions);
          callback(null, portItem.comName);
          return;
        }
        catch (err) {

        }
      }
      callback(new Error('searchDev: device not found on every ports'));
    }
  })
}

module.exports = searchDev;
