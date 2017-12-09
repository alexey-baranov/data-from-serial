/*
  Периодически отправляет пакет данных в СОМ-порт
  Формат пакета (hex): <55> <AA> <length> [<data>] <crc>
  где   55 AA  - заголовок
        length - длина массива данных
        data   - массив данных (может быть от 0 до 255 байт)
        crc    - контрольная сумма всего пакета (XOR)
        
  в функции "setData" считать нужные датчики и установить данные
*/

/*
*  тут прочитать состояние ног и установить 
*/  
void setData(){
  setPin(1, 1);
  setPin(5, 10);
}

//#define BLINK

//настройки моргания лампочки
#ifdef BLINK
int led = 13;
int show = 1;
#endif

#define PACKET_LEN 260
int  packetPos = 0;
byte packet[PACKET_LEN]; //до 255 байт данных + 4 байта  

void setup() {                
#ifdef BLINK
  pinMode(led, OUTPUT); 
#endif
  Serial.begin(9600);
}

void loop() {
#ifdef BLINK
//  можно мограть, чтобы видно было что работает
  if(show) digitalWrite(led, HIGH);
  else digitalWrite(led, LOW);
  show = 1 - show;
#endif
  initPacket();
  setData();
  packet[packet[2]+3] = calcCRC();
  Serial.write(packet, packet[2]+4); 
  delay(1000);
}

/*
*  добавление значения в пакет, добавляется 2 байта: номер пина и значение
*/
void setPin(byte pinNumber, byte value){
  if(packet[2]<PACKET_LEN-6){
    packet[packet[2]+3] = pinNumber;
    packet[packet[2]+4] = value;
    packet[2] += 2;
  }
}

byte calcCRC(){
  byte CRC=0;
  for(int i=0;i<(packet[2]+3);i++) CRC ^= packet[i];
  return CRC;
}

//обнуляем буфер и прописываем заголовок
void initPacket(){
  for(int i=0;i<PACKET_LEN;i++) packet[i]=0;
  packet[0] = 0x55;
  packet[1] = 0xaa;
}  

