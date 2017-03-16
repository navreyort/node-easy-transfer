/*jshint esversion: 6 */
export class SerialTransmitData {
  constructor(){
    //XXX Example declaration of variables
    this.c = new Uint16Array(1);
    this.bo = new Uint8Array(1);
    this.b = new Int8Array(1);
    this.s = new Int16Array(1);
    this.i = new Int32Array(1);

    this.c[0] = this.b[0] = this.s[0] = this.i[0] = 10;
    this.bo[0] = 1;
  }

  toByteBuffer(){
    var dataSize = this.getDataSize();
    var totalSize = dataSize+SerialTransmitData.ATTACHED_PACKET_SIZE;
    var checksum = dataSize;
    var buffer = new ArrayBuffer(totalSize);

    //Append packet header
    buffer[0] = SerialTransmitData.SERIAL_INIT1;
    buffer[1] = SerialTransmitData.SERIAL_INIT2;
    buffer[2] = dataSize;

    //append data
    var curIndex = 3;
    for(var key in this){
      if(this.hasOwnProperty(key)){
        if(this[key] instanceof Int16Array || this[key] instanceof Uint16Array){ //short or char
          buffer[curIndex] = (this[key][0] & 255);
          buffer[curIndex + 1] = this[key][0] >> 8;
          curIndex += this[key].BYTES_PER_ELEMENT;
        }
        else if(this[key] instanceof Int32Array || this[key] instanceof Uint32Array){ //Integer/long
          buffer[curIndex] = (this[key][0] & 255);
          buffer[curIndex + 1] = this[key][0] >> 8;
          buffer[curIndex + 2] = this[key][0] >> 16;
          buffer[curIndex + 3] = this[key][0] >> 24;
          curIndex += this[key].BYTES_PER_ELEMENT;
        }
        else if(this[key] instanceof Int8Array || this[key] instanceof Uint8Array){
          buffer[curIndex] = this[key][0];
          curIndex += this[key].BYTES_PER_ELEMENT;
        }
      }
    }

    for(var k=SerialTransmitData.DATA_START_INDEX;k<totalSize;k++){
      checksum ^= buffer[k];
    }

    buffer[curIndex] = checksum;

    var buf = new Buffer(dataSize+SerialTransmitData.ATTACHED_PACKET_SIZE);
    for(var l=0;l<dataSize+SerialTransmitData.ATTACHED_PACKET_SIZE;l++){
      buf[l] = buffer[l];
    }

    return buf;
  }

  toData(byteArray){
    var checksum = byteArray[SerialTransmitData.DATA_SIZE_INDEX];
    for(var i=SerialTransmitData.DATA_START_INDEX;i<byteArray.byteLength-1;i++){
      checksum ^= byteArray[i];
    }

    if(checksum == byteArray[byteArray.byteLength-1]){
      var curIndex = SerialTransmitData.DATA_START_INDEX;
      for(var key in this){
        if(this.hasOwnProperty(key)){
          if(this[key] instanceof Int8Array || this[key] instanceof Uint8Array){ //byte or bool
            this[key][0] = byteArray[curIndex];
            curIndex += this[key].BYTES_PER_ELEMENT;
          }
          else if(this[key] instanceof Int16Array || this[key] instanceof Uint16Array){ //short or char
            this[key][0] = (byteArray[curIndex+1] << 8 | byteArray[curIndex]);
            curIndex += this[key].BYTES_PER_ELEMENT;
          }
          else if(this[key] instanceof Int32Array){ //integer/long
            this[key][0] = (byteArray[curIndex+3] << 24 | byteArray[curIndex+2] << 16 | byteArray[curIndex+1] << 8 | byteArray[curIndex]);
            curIndex += this[key].BYTES_PER_ELEMENT;
          }
          //XXX no Int64Array unfortunately...
        }
      }
    }
  }

  getDataSize(){
    var size = 0;
    for(var key in this){
      if(this.hasOwnProperty(key)){
        size += this[key].BYTES_PER_ELEMENT;
      }
    }
    return size;
  }

  getPacketSize(){
    return this.getDataSize() + SerialTransmitData.ATTACHED_PACKET_SIZE;
  }

  getHeaderSize(){
    return SerialTransmitData.ATTACHED_PACKET_SIZE - 1;
  }
}

//Data type is represented with typed array
SerialTransmitData.SERIAL_INIT1 = 0x06;
SerialTransmitData.SERIAL_INIT2 = 0x15;
SerialTransmitData.ATTACHED_PACKET_SIZE = 4;
SerialTransmitData.DATA_SIZE_INDEX = 2;
SerialTransmitData.DATA_START_INDEX = 3;

export default SerialTransmitData;
