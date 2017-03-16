#ifndef EVENTQUEUE_H
#define EVENTQUEUE_H

#include "PeripheralsAndProtocols.h"

template<typename T>
class EventQueue {
  public:
    EventQueue():queueID(0){init();};
    boolean isEmpty() ;
    boolean isFull() ;
    int getNumEvents() ;
    boolean enqueueEvent(T *data) ;
    boolean dequeueEvent(T *data) ;
    boolean isLocked() ;
    void setQueueID(byte id) ;
    byte getQueueID() ;
    
private:
     T *events[kEventQueueSize];
     int eventQueueHead;
     int eventQueueTail;
     int numEvents;
     boolean lock;
     byte queueID;
     void init();
};

template<typename T>
inline boolean EventQueue<T>::isLocked() {
  return this->lock;
}

template<typename T>
inline void EventQueue<T>::init() {
  int i;
  
  this->eventQueueHead = 0;
  this->eventQueueTail = kEventQueueSize - 1;
  this->numEvents = 0;
  
//  for (i = 0; i < kEventQueueSize; i++) {
//    events[i] = (T*) malloc(sizeof(T));
//    memset(events+i,0,sizeof(T));
//  }
  
  this->lock = false;
}

template<typename T>
inline boolean EventQueue<T>::isEmpty() {
  return (this->numEvents == 0);
}

template<typename T>
inline boolean EventQueue<T>::isFull() {
  return (this->eventQueueHead == this->eventQueueTail) && (this->numEvents >= kEventQueueSize);
}

template<typename T>
inline int EventQueue<T>::getNumEvents() {
  return this->numEvents;
}

template<typename T>
inline boolean EventQueue<T>::enqueueEvent(T *data) {
  this->lock = true;
  
  if (this->isFull()) {
    // log the queue full error
    #ifdef kDebug
    Serial.println("Queue full");
    #endif
    return false;
  }

  // store the event
  this->events[this->eventQueueHead] = data;
    
  // update queue head value
  this->eventQueueHead = (this->eventQueueHead + 1) % kEventQueueSize;

  // update number of events in queue
  this->numEvents++;
 
  this->lock = false;
  
  return true;
}

template<typename T>
inline boolean EventQueue<T>::dequeueEvent(T *data) {
  this->lock = true;
  
  if (this->numEvents == 0) {
    return false;
  }

  this->eventQueueTail = (this->eventQueueTail + 1) % kEventQueueSize;

  // store event code and event parameter
  // into the user-supplied variables
  memcpy(data,this->events[this->eventQueueTail],sizeof(T));
  free(this->events[this->eventQueueTail]);
  this->events[this->eventQueueTail] = NULL;
  
  // update number of events in queue
  this->numEvents--;
  
  this->lock = false;
  return true;
}

template<typename T>
void EventQueue<T>::setQueueID(byte id)  {
  this->queueID = id;
}

template<typename T>
byte EventQueue<T>::getQueueID()  {
  return this->queueID;
}
#endif //EVENTQUEUE_H
