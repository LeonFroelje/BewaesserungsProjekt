#pragma once
#include "Sensors.hpp"
#include "Valve.hpp"
#include "Pump.hpp"

class Plant{
    public:/*
        Plant(const int id, const char* name, double minHumidity, MoistureSensor sensor,
              Valve valve);
        */
        Plant(const int id, const char* name, double minHumidity, unsigned long readingTime,
        unsigned long readingLength, unsigned long wateringTime, MoistureSensor sensor, Valve valve, Pump pump);
        double getHumidity(Reading r);
        double getMinHumidity();
        const char* getName() const;
        const int getId() const;
        MoistureSensor getSensor();
        Reading getReading();

        void setMinHumidity(double minHumidity);
        void setSensor(MoistureSensor sensor);
        void water();
        void setPump(Pump pump);
        void setValve(Valve Valve);
        void setReadingTime(unsigned long millis);
        void setReadingLength(unsigned long length);
        void setWateringTime(unsigned long millis);
        void setOK(bool value);

        bool isOK();


    private:
        const int id;
        const char* name;
        MoistureSensor sensor;
        double minHumidity;
        Valve valve;
        Pump pump;
        unsigned long readingTime;
        unsigned long readingLength;
        unsigned long wateringTime;
        bool OK;
};

Plant::Plant(const int id, const char* name, double minHumidity, unsigned long readingTime,
            unsigned long readingLength, unsigned long wateringTime, MoistureSensor sensor, Valve valve, Pump pump):
    id(id),
    name(name),
    minHumidity(minHumidity),
    sensor(sensor),
    readingLength(readingLength),
    readingTime(readingTime),
    wateringTime(wateringTime),
    pump(pump),
    valve(valve),
    OK(true)
    {};

const char* Plant::getName() const{
    return name;
}

const int Plant::getId() const{
    return id;
}

Reading Plant::getReading(){
    int timeout = readingTime / readingLength;
    return sensor.getReading(readingTime, timeout);
}

double Plant::getHumidity(Reading r){
    // read the plants humidity and convert it to %
    return 100 * (1 - ((r.getAverage() - sensor.getLowest()) / (sensor.getHighest() - sensor.getLowest())));
}

double Plant::getMinHumidity(){
    return minHumidity;
}

MoistureSensor Plant::getSensor(){
    return sensor;
}

void Plant::setSensor(MoistureSensor Sensor){
    this -> sensor = Sensor;
}

void Plant::setMinHumidity(double humidity){
    minHumidity = humidity;
}

void Plant::water(){
    if(!pump.isPumping()){
        pump.start();
    }
    valve.open();
    long long startTime = millis();
    while(startTime + wateringTime > millis()){
        // Do nothing
    }
    pump.stop();
    valve.close();
}

void Plant::setPump(Pump Pump){
    pump = Pump;
}

void Plant::setValve(Valve Valve){
    valve = Valve;
}

void Plant::setReadingTime(unsigned long millis){
    readingTime = millis;
}
void Plant::setReadingLength(unsigned long length){
    readingLength = length;
}

void Plant::setWateringTime(unsigned long millis){
    wateringTime = millis;
}

bool Plant::isOK(){
    return this -> OK;
}

void Plant::setOK(bool value){
    this -> OK = value;
}