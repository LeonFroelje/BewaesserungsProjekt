#pragma once
#include "Relay.hpp"

class Pump{
    public:
        explicit Pump(Relay relay);
        bool isPumping();
        void start();
        void stop();
    
    private:
        Relay relay;
        bool pumping;
};

Pump::Pump(Relay relay):
    relay(relay)
    {
        this -> pumping = false;
};

bool Pump::isPumping(){
    return pumping;
};

void Pump::start(){
    relay.on();
    pumping = true;
};

void Pump::stop(){
    relay.off();
    pumping = false;
};