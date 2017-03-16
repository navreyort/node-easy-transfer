import SerialIO from './SerialIO';
import SerialTransmitData from './SerialTransmitData';

//TODO test script between arduino and nodejs
var serialIO = new SerialIO(new SerialTransmitData(), function(data){
  console.log('Microcontroller response:',data);
}, '/dev/tty.usbmodem1421');

//Write data
setInterval(function(){
  serialIO.write();
}, 1000);
