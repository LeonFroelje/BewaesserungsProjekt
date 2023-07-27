#pragma once
#include "Relay.hpp"

class Valve{
    public:
        explicit Valve(Relay relay);
        void open();
        void close();
        bool isOpen();

    private:
        Relay relay;
        bool closed;
};

Valve::Valve(Relay relay) :
    relay(relay)
    {
        close();
    };

void Valve::open(){
    this -> relay.on();
    closed = false;
};

void Valve::close(){
    this -> relay.off();
    closed = true;
};

bool Valve::isOpen(){
    return ! closed;
};