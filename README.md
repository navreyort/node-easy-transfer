# node-easy-transfer

node-easy-transfer is an implementation of [EasyTransfer](https://github.com/madsci1016) in NodeJS. It aims to transfer serial data between Arduino and NodeJS effortlessly.

## Test

The test program included in this project checks if the values going back and forth between the NodeJS project and arduino is consistent. The NodeJS program initiates communication with an arduino board and the board returns the same exact set of value back to the NodeJS program. The incoming serial values are printed in the console. The values of outgoing and incoming serial values should be identical to prove that the program is actually working. To run the test program:

1. Open arduino/EasyTransferTest/EasyTransferTest.ino in Arduino IDE.
2. Upload the ino program to arduino (I used Arduino UNO and Teensy for testing).
3. Set the port name for arduino in dev/index.js variable. e.g. /dev/tty.usbmodemfd121 for mac.
6. Run NodeJS with `npm test`

When you successfully run the program, you should see system prints similar to the following:

    Microcontroller response: SerialTransmitData {
      c: Uint16Array [ 10 ],
      bo: Uint8Array [ 1 ],
      b: Int8Array [ 10 ],
      s: Int16Array [ 10 ],
      i: Int32Array [ 10 ] }

## Customize

#### Defining your data structure
EasyTransfer assumes that the data structures on two programs (i.e. An arduino-like microcontroller and an OS side software) are the same. The receiving data structure on the arduino code must correspond to the transmiting data structure on the NodeJS program and vice versa.

For example, in the arduino side test code (arduino/EasyTransferTest/PeripheralsAndProtocols.h), the receiving data structure looks like this:

    typedef struct __attribute__((__packed__)) {
        uint16_t c;
        uint8_t bo;
        int8_t b;
        int16_t s;
        int32_t i;
    } SerialReceiveData;

The transmitting data structure on the NodeJS program looks like this:

    constructor(){
      this.c = new Uint16Array(1);
      this.bo = new Uint8Array(1);
      this.b = new Int8Array(1);
      this.s = new Int16Array(1);
      this.i = new Int32Array(1);
    }

If you want to cusomize this program for your own project, modifying these values might be a good starting point. The maximum size of the data structure cannot exceed 256 bytes. Note that the order of each type in the data structure also matters.

#### Adding behavior
##### Arduino
SerialEventHandler class is responsible for managing serial data coming in and out of arduino. You will need to use serialEventHandler.event for transmitting serial data and serialEventHandler.getIncomingEvent to wait for data to be received.

###### Receiving serial data
In the test code (in arduino/EasyTransferTest/EasyTransferTest.ino), Arduino receives serial messages using:

	if(serialEventHandler.getIncomingEvent(&receiveData)){}

In this if statement, you can add your custom functions, switch statements, and etc... based on how you'd like your arduino to behave.

###### Transmitting serial data
In the test code (arduino/EasyTransferTest/EasyTransferTest.ino), arduino transmits serial data using:

	serialEventHandler.event(sendData);

##### NodeJS
SerialIO.js is responsible for managing serial data coming in and out of the NodeJS program. SerialIO.js sends out serial data to arduino using:

	serialIO.write

The NodeJS program receives serial data through:

	serialIO.read

This method decodes incoming serial message and packages up into SerialTransmitData.js. Everytime when SerialIO.js decodes the serial data, `onReceived` callback function is called. This callback function is required to interact with serial data from arduino outside of SerialIO.js.

## TODO
* The project needs to be tested with Windows and Linux machines.
* More example codes

## License

MIT License applies to this code repository

    Copyright (C) 2017 Akito van Troyer

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
