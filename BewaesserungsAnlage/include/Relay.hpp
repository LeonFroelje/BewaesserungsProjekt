#pragma once
#include "RaspberryPi.hpp"

class Relay{
    public:
        explicit Relay(int pin);
        void on();
        void off();
        bool isOn();
        int getPin();

    private:
        // all viable output pins
        int viablePins[22] = {0, 1, 2, 3, 4, 5, 12, 13, 14,
            15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33};
        int pin;
        bool isOff;
};

Relay::Relay(int Pin){
    int index = -1;
    for(int i = 0; i < 22; i++){
        if(viablePins[i] == Pin){
            index = i;
        }
    }
    if(index >= 0){
        pin = Pin;
        pinMode(pin, OUTPUT);
        digitalWrite(pin, LOW);
        isOff = true;
    }
    else{
        std::string err{};
        pin = -1;
        err.append("Invalid output pin selected for relay, Pin: ");
        err.append(std::to_string(Pin));
        RaspberryPiInterface::log(err.c_str());
    }
};

void Relay::on(){
    // Relay is normally open => current flows when pin signal is low
    digitalWrite(pin, HIGH);
    isOff = false;
};

void Relay::off(){
    digitalWrite(pin, LOW);
    isOff = true;
};

bool Relay::isOn(){
    return !isOff;
};

int Relay::getPin(){
    return pin;
};