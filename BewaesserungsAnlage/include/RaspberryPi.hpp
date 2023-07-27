#pragma once
#include <vector>
#include <string>
#include <HTTPClient.h>
#include <WiFi.h>
#include <stdexcept>
#include <array>

class Plant;
class Reading;
std::vector<Plant> parsePlantResponse(std::string response, int size);
// TODO: http response code handling

//aPi 
class RaspberryPiInterface{
    public:
        RaspberryPiInterface(char* address, char* port);

        const int getPlantCount(int controllerId);
        std::vector<Plant> getPlants(int controllerId);
        std::array<int, 2> getDht(int controllerId);
        double getTimeSinceLastWatering(int plantId);
        std::vector<double> getCalibrationValues(int sensorId);
        long long int getInterval(int controllerId);

        int sendMoistureReading(Reading &reading, int id, bool watered);
        int sendDhtReading(int id, double temperature, double humidity);
        int sendCalibrationValue(int sensorId, double value, const char* which);
        int sendCalibrationValues(int id, double lowestValue, double highestValue);
        int sendWateringTimestamp(int id);
        
        int ping();

        static void log(const char* err);

        bool isOK(int plantId);

        char* getIp();
        char* getPort();
        

    private:
        char* address;
        char* port;
        std::string prepareRequest();
};

RaspberryPiInterface::RaspberryPiInterface(char* address, char* port){
    this -> address  = address;
    this -> port = port;
}
/**
 * @brief Send request to Server to retrieve all the sensors that are currently in use
 * @return std::string JSON string containing Sensor object blueprints for each sensor
 */
std::vector<Plant> RaspberryPiInterface::getPlants(int controllerId){
    WiFiClient client;
    HTTPClient http;
    String response;

    std::string request = prepareRequest();

    request.append("Plants/");
    request.append(std::to_string(controllerId));
    // send request
    http.begin(client, request.c_str());
    int httpCode = http.GET();
    // httpCode < 0 => Error occured in the HTTPClient.h library
    if(httpCode < 0){
        throw std::runtime_error("HTTP request library had an error");
    }
    // Request was sucessfull
    else if(httpCode >= 200 && httpCode <= 299){
        response = http.getString();
    }
    // Request wasn't successfull but no error occured in the library
    else{
        http.end();
        std::vector<Plant> a{};
        return a;
    }
    // Close connection to the server
    http.end();
    // Cast to std::string and return response body
    return parsePlantResponse(std::string{response.c_str()}, 4096);
}

long long int RaspberryPiInterface::getInterval(int controllerId){
    HTTPClient http;
    std::string req = prepareRequest();

    req.append("Interval/");
    req.append(std::to_string(controllerId));

    http.begin(req.c_str());
    int responseCode = http.GET();
    long long int interval;
    switch(responseCode){
        case 200:{
            std::string s{http.getString().c_str()};
            interval = std::stoul(s);
            break;
        }
        case 404:
            interval = -1;
            break;
        case 500:
            interval = -2;
            break;
        case 400:
            interval = -3;
            break;
        default:
            interval = -4;
            break;
    }
    http.end();
    return interval;
}

std::array<int, 2> RaspberryPiInterface::getDht(int controllerId){
    HTTPClient http;
    std::string req = prepareRequest();
    req.append("Dht11s/");
    req.append(std::to_string(controllerId));
    
    http.begin(req.c_str());
    int responseCode = http.GET();

    std::array<int, 2> dhtValues;
    int id;
    int pin;
    if(responseCode == 200){
        std::string response{http.getString().c_str()};
        int seperation = response.find_first_of(",");

        id = std::stoi(response.substr(0, seperation));
        pin = std::stoi(response.substr(seperation + 1));
    }
    else{
        id = -1;
        pin = -1;
    }
    dhtValues[0] = id;
    dhtValues[1] = pin;
    http.end();
    return dhtValues;
} 


int RaspberryPiInterface::sendCalibrationValue(int sensorId, double value, const char* which){
    HTTPClient http;

    std::string req = prepareRequest();
    req.append("MoistureSensors/CalibrationValues/");
    req.append(std::to_string(sensorId));
    req.push_back('/');
    req.append(which);
    req.push_back('/');
    req.append(std::to_string(value));
    // send request
    http.begin(req.c_str());
    int httpCode = http.GET();

    http.end();

    return httpCode;
}


int RaspberryPiInterface::sendMoistureReading(Reading &reading, int id, bool watered){
    HTTPClient http;

    std::string req = prepareRequest();
    req.append("Plants/MoistureReadings/");

    double min = reading.getMinimum();
    double max = reading.getMaximum();
    double avg = reading.getAverage();

    req.append(std::to_string(id));
    req.push_back('/');
    req.append(std::to_string(min));
    req.push_back('/');
    req.append(std::to_string(max));
    req.push_back('/');
    req.append(std::to_string(avg));
    req.push_back('/');
    if(watered){
        req.append("true");
    }
    else{
        req.append("false");
    }
    Serial.println(req.c_str());
    http.begin(req.c_str());
    int httpResponse = http.GET();
    http.end();

    return httpResponse;
}


int RaspberryPiInterface::sendDhtReading(int id, double temperature, double humidity){
    HTTPClient http;

    std::string req = prepareRequest();
    req.append("Dht11s/Readings/");
    req.append(std::to_string(id));
    req.push_back('/');
    req.append(std::to_string(temperature));
    req.push_back('/');
    req.append(std::to_string(humidity));

    http.begin(req.c_str());
    int responseCode = http.GET();
    http.end();

    return responseCode;
}

int RaspberryPiInterface::ping(){
    HTTPClient http;

    std::string req = prepareRequest();
    req.append("ping");
    
    http.begin(req.c_str());
    int httpResponse = http.GET();
    http.end();

    return httpResponse;
}

bool RaspberryPiInterface::isOK(int plantId){
    HTTPClient http;

    std::string req = prepareRequest();
    req.append("Plants/isOk/");
    req.append(std::to_string(plantId));
    
    http.begin(req.c_str());
    
    if(http.GET() == 200){
        http.end();
        return true;
    }
    else{
        http.end();
        return false;
    }
    
}


void RaspberryPiInterface::log(const char* err){
    HTTPClient http;

    std::string request{"http://"};
    request.append("192.168.178.69");
    request.push_back(':');
    request.append("5000");
    request.append("/EspApi/");
    request.append("log");
    
    http.begin(request.c_str());
    http.addHeader("Content-Type", "text/plain");

    int responseCode = http.POST(err);
    http.end();
}


std::string RaspberryPiInterface::prepareRequest(){
    std::string request{"http://"};
    request.append(address);
    request.push_back(':');
    request.append(port);
    request.append("/EspApi/");
    return request;
}

char* RaspberryPiInterface::getIp(){
    return address;
}

char* RaspberryPiInterface::getPort(){
    return port;
}