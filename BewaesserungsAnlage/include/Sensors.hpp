#pragma once
#include <DHT.h>
#include <vector>
#include "Reading.hpp"
#include "RaspberryPi.hpp"

#define VIABLE_ADC_PINS 6

class Reading;
class RaspberryPiInterface;
/*
class Sensor{
    public:
        virtual void calibrate(RaspberryPiInterface &pi) = 0;
        virtual Reading getReading(int milliseconds, int frequency) = 0;
    protected:
        virtual double read() = 0;
};
*/
/*
================================================================================
*/

class MoistureSensor /*: public Sensor*/{
    public:
        explicit MoistureSensor(int id);
        MoistureSensor(int id, int pin);
        MoistureSensor(int id, int pin, double lowest, double highest);
        Reading getReading(int milliseconds, int frequency);

        void calibrateHighest(RaspberryPiInterface &pi);
        void calibrateLowest(RaspberryPiInterface &pi);

        int getPin() const;
        int getId() const;
        double getLowest() const;
        double getHighest() const;
        
        void setPin(int pin);
        void setLowest(double value);
        void setHighest(double value);


    private:
        int id;
        int pin;
        double lowestReading;
        double highestReading;
        float readingToPercent(double readingValue);     
        double read();
        // all viable analog to digital converter pins
        int ADCPins[VIABLE_ADC_PINS] = {36, 39, 34, 35, 32, 33};
        
};

int MoistureSensor::getPin() const {return pin;};

void MoistureSensor::setPin(int pin){this -> pin = pin;};

MoistureSensor::MoistureSensor(int id):
    id(id){
        pin = -1;
        lowestReading = -1;
        highestReading = -1;
    };

MoistureSensor::MoistureSensor(int id, int Pin):
    id(id),
    lowestReading(2000),
    highestReading(4095){
        int index = -1;
        for(int i = 0; i < VIABLE_ADC_PINS; i++){
            if(ADCPins[i] == Pin){
                index = i;
            }
        }
        if(index >= 0){
            pin = Pin;
        }
        else{
            this -> pin = -1;
            std::string err{"Invalid pin selected for Moisture sensor "};
            err.append(std::to_string(id));
            err.append("Pin: ");
            err.append(std::to_string(Pin));
            RaspberryPiInterface::log(err.c_str());
        }
    };

MoistureSensor::MoistureSensor(int id, int pin, double lowest, double highest):
    MoistureSensor(id, pin)
    {
        lowestReading = lowest;
        highestReading = highest;
    };

Reading MoistureSensor::getReading(int milliseconds, int timeout){
    const std::vector<double> data{};
    Reading reading{data};
    unsigned long start = millis();
    // Read the sensor value for the specified time with the specified frequency 
    while (millis() - start  <= milliseconds)
    {
        double value = read();
        reading.add(value);
        unsigned long timeoutStart = millis();
        // do nothing for a while
        delay(timeout);        
    }
    return reading;
}

int MoistureSensor::getId() const {return id;};

double MoistureSensor::getHighest() const{
    return highestReading;
}

double MoistureSensor::getLowest() const{
    return lowestReading;
}

void MoistureSensor::setLowest(double value ){
    lowestReading = value;
}

void MoistureSensor::setHighest(double value){
    highestReading = value;
}

void MoistureSensor::calibrateHighest(RaspberryPiInterface &pi){
    Reading calibration_reading = getReading(30000, 300);
    try{
        double highestReading = calibration_reading.getMaximum();
        pi.sendCalibrationValue(id, highestReading, "highest_reading");
    }    
    catch(std::exception &e){
        RaspberryPiInterface::log(e.what());
    }
}

void MoistureSensor::calibrateLowest(RaspberryPiInterface &pi){
    Reading calibration_reading = getReading(30000, 500);
    try{
        double lowestReading = calibration_reading.getMinimum();
        pi.sendCalibrationValue(id, lowestReading, "lowest_reading");
    }    
    catch(std::exception &e){
        RaspberryPiInterface::log(e.what());
    }
}

double MoistureSensor::read() {return pin >= 0 ? analogRead(pin) : -1;};
