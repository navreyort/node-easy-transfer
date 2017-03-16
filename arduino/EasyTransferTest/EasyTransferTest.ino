
#include "SerialEventHandler.h"

SerialEventHandler serialEventHandler;
SerialSendData sendData;

void setup(){
  serialEventHandler.setup();
  pinMode(13,OUTPUT);
  digitalWrite(13,LOW);
  sendData.b=10;
  sendData.s=20;
  sendData.i=30;
  sendData.bo=true;
  sendData.c='A';
}

void loop(){
  serialEventHandler.update();
  handleIncomingSerial();
  
  //Uncomment this to test sending
  //serialEventHandler.event(sendData);
  //delay(5000);
}

//Send back what came in
void handleIncomingSerial(){
  static SerialReceiveData receiveData;
  if(serialEventHandler.getIncomingEvent(&receiveData)){
   //XXX Receive Example
    SerialSendData sendData;
    memcpy(&sendData,&receiveData,sizeof(SerialSendData));
    serialEventHandler.event(sendData);
  }
}
