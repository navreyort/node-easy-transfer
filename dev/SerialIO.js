/*jshint esversion: 6 */

import SerialPort from 'serialport';
import SerialTransmitData from './SerialTransmitData';

class SerialIO {
  constructor(data, onReceived, port, baudRate){
    this.data = data;
    this.onReceived = onReceived;
    this.packetSize = this.data.getPacketSize();
    this.buffer = [];
    this.arrBuf = new ArrayBuffer(this.packetSize);
    this.isOpen = false;

    this.serialPort = new SerialPort.SerialPort(port, {
      baudrate: baudRate || 19200,
      parity: 'none',
      stopBits: 1,
      dataBits: 8
    });

    var self = this;
    this.serialPort.on("open", function () {
      console.log('serial open');
      self.isOpen = true;
    });

    this.serialPort.on('data', function(data) {
      self.read(data);
    });
  }

  write(data){
    if(this.isOpen){
      if(data){
        this.serialPort.write(data.toByteBuffer());
      }
      else{
        this.serialPort.write(this.data.toByteBuffer());
      }
    }
  }

  read(data){
    for(var i=0;i<data.length;i++){
      this.buffer.push(data[i]);
    }

    while(this.buffer.length > this.data.getHeaderSize()){
      if(this.buffer.length >= this.packetSize){
        if(this.buffer[0] == SerialTransmitData.SERIAL_INIT1 &&
          this.buffer[1] == SerialTransmitData.SERIAL_INIT2 &&
          this.buffer[2] == this.data.getDataSize()){

          for(var k=0;k<this.packetSize;k++){
            this.arrBuf[k] = this.buffer[k];
          }

          this.buffer.splice(0,this.packetSize);
          this.data.toData(this.arrBuf);
          if(this.onReceived) this.onReceived(this.data);
        }
        else{
          this.buffer.splice(0,this.data.getHeaderSize());
          console.warn("Packet not aligned",this.buffer[0], SerialTransmitData.SERIAL_INIT1);
        }
      }
      else{
        break;
      }
    }
  }
}

export default SerialIO;
