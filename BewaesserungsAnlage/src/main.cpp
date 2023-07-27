#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <thread>
#include <array>
#include "Sensors.hpp"
#include "RaspberryPi.hpp"
#include "Relay.hpp"
#include "Valve.hpp"
#include "Pump.hpp"
#include "Plant.hpp"
#include "Request.hpp"
#include "StatusLED.hpp"

#define DHTTYPE DHT11
const int CONTROLLER_ID = 1;
const int MAX_CLIENTS = 5;
const int PORT = 80;
const char* SSID = "";
const char* PASSWORD = "";
const int RED_PIN = 1;
const int GREEN_PIN = 3;
const int BLUE_PIN = 21;
const int MIN_INTERVALL = 60000;
const int MAX_TRIES = 5;
char* API_PORT = "80";

//Route handlers
const char* handlePlantHumidityRoute(std::string url);
const char* handlePlantPumpPinRoute(std::string url);
const char* handlePlantValvePinRoute(std::string url);
const char* handlePlantMoistureSensorRoute(std::string url);
const char* handlePlantReadingTimeRoute(std::string url);
const char* handlePlantReadingLengthRoute(std::string url);
const char* handlePlantWateringTimeRoute(std::string url);
const char* handleMoistureSensorCalibrateRoute(std::string url);
const char* handleIntervalRoute(std::string url);

//Routes
const std::string plantMinHumidityRoute = "Plants/minHumidity";
const std::string plantPumpPinRoute = "Plants/pumpPin";
const std::string plantValvePinRoute = "Plants/valvePin";
const std::string plantMoistureSensorRoute = "Plants/moistureSensor";
const std::string plantReadingTime = "Plants/readingTime";
const std::string plantReadingLength = "Plants/readingLength";
const std::string plantWateringTime = "Plants/wateringTime";

const std::string MoistureSensorCalibrate = "MoistureSensors/calibrate";

const std::string setInterval = "Interval";


double readingAvgToPercent(double avg, MoistureSensor sensor);
void handlePlants(std::vector<Reading> &readings);
int findPlant(int id);
// Server config
const int maxClients = MAX_CLIENTS;
WiFiServer server(PORT);
WiFiClient clients[maxClients];

unsigned long prev_reading = 0;
std::vector<Reading> readings{};

RaspberryPiInterface pi = RaspberryPiInterface{"192.168.178.69", "5000"};
// default intervall
long long int INTERVAL = 0;
const long long int RESET_TIMER = 86400000;
//const int plantCount = pi.getPlantCount(CONTROLLER_ID);
std::vector<Plant> plants;

DHT dht{0, DHT11};
int dhtId = -1;

StatusLED STATUS_LED{RED_PIN, GREEN_PIN, BLUE_PIN};

void setup() {
  // initialize serial communication at 115200 bits per second:
  Serial.begin(115200);
  // stationary WiFi-Mode to interact with the API on my raspberry pi
  WiFi.mode(WIFI_STA);
  // disconnect from any WiFi the esp was previously connected to
  WiFi.disconnect();
  // connect to the previously defined WiFi
  // as long as there is no WiFi connection, the status LED is red
  STATUS_LED.off();
  WiFi.begin(SSID, PASSWORD);
  for( ; WiFi.status() != WL_CONNECTED ; ){
    STATUS_LED.on(Color::RED);
    delay(1000);
    STATUS_LED.off(Color::RED);
  }

  int piAvailability = pi.ping();
  Serial.println(piAvailability);
  while(piAvailability != 200){
    switch(piAvailability){
      case -4:
        STATUS_LED.off();
        STATUS_LED.on(Color::RED, Color::BLUE);
        break;
      
      case -5:
        STATUS_LED.off();
        STATUS_LED.on(Color::RED);
        STATUS_LED.on(30, Color::GREEN);
        break;

      case -7:
        STATUS_LED.off();
        STATUS_LED.on(Color::RED);
        STATUS_LED.on(30, Color::BLUE);
        break;
      default:
        STATUS_LED.off();
        STATUS_LED.on(Color::RED);
    }
    delay(1000);
    piAvailability = pi.ping();
  }

  INTERVAL = pi.getInterval(CONTROLLER_ID);
  Serial.println(INTERVAL);
  while(INTERVAL <= 0){
    STATUS_LED.off();
    STATUS_LED.on(Color::BLUE);
    delay(1000);
    INTERVAL = pi.getInterval(CONTROLLER_ID);
    STATUS_LED.off();
    delay(1000);
  }
  STATUS_LED.off();
  STATUS_LED.on(Color::GREEN);
  STATUS_LED.on(Color::BLUE);
  // set the analog to digital resolution to 12 bits (0-4096)
  analogReadResolution(12);
  // retrieve the Plants from the db  
  plants = pi.getPlants(CONTROLLER_ID);
  
  std::array<int, 2> dhtValues = pi.getDht(CONTROLLER_ID);
  dhtId = dhtValues[0];
  // check if there is a dht assigned to the controller
  if(dhtId > 0){
    DHT d{dhtValues[1], DHTTYPE};
    dht = d;
  }
  
  // start the server
  server.begin();

  STATUS_LED.off();
  // setup finished
  STATUS_LED.on(Color::GREEN);
  dht.begin();
  RaspberryPiInterface::log("START");
}


void loop() {
  // kinda hacky, but the esp has to reset every day presumably due to memory leaks somewhere in the code 
  if(millis() > RESET_TIMER){
    ESP.restart();
  }
  // listen for requests
  WiFiClient client = server.accept();
  if(client){
    // find a slot for the new client
    for(int i = 0; i < maxClients; i++){
      if(!clients[i]){
        clients[i] = client;
        break;
      }
    }
  }
  
  // go through the slots allocated for the clients
  for(int i = 0; i < maxClients; i++){
    // if there's a client at the current slot
    if(clients[i] && clients[i].available() > 0){
      // read the request
      std::string requestText{clients[i].readString().c_str()};
      Request req{requestText};
      std::string url = req.getHeaders().getUrl();
      /*
      ROUTES:
        Plants/minHumidity/:plantId/:minHumidity
        Plants/pumpPin/:plantId/:pumpPin
        Plants/valvePin/:plantId/:valvePin
        Plants/moistureSensor/:plant_id/:sensorId/:sensorPin
        Plants/readingTime/:plant_id/:readingTime
        Plants/readingLength/:plant_id/:readingLength
        Plants/wateringTime/:plant_id/:wateringTime

        MoistureSensors/calibrate/:plant_id

        Interval/:millis
      */
      /* really ugly, probably better implemented with a bst and some callback
      functions in case the given url matches
      */
      // compare url to routes and handle in case of match
      if(url.find(plantMinHumidityRoute) != std::string::npos){
        clients[i].write(handlePlantHumidityRoute(url));
      }
      else if(url.find(plantPumpPinRoute) != std::string::npos){
        clients[i].write(handlePlantPumpPinRoute(url));
      }
      else if(url.find(plantValvePinRoute) != std::string::npos){
        clients[i].write(handlePlantValvePinRoute(url));
      }
      else if(url.find(plantMoistureSensorRoute) != std::string::npos){
        clients[i].write(handlePlantMoistureSensorRoute(url));
      }
      else if(url.find(plantReadingTime) != std::string::npos){
        clients[i].write(handlePlantReadingTimeRoute(url));
      }
      else if(url.find(plantReadingLength) != std::string::npos){
        clients[i].write(handlePlantReadingLengthRoute(url));
      }
      else if(url.find(plantWateringTime) != std::string::npos){
        clients[i].write(handlePlantWateringTimeRoute(url));
      }
      else if(url.find(MoistureSensorCalibrate) != std::string::npos){
        clients[i].write(handleMoistureSensorCalibrateRoute(url));
      }
      else if(url.find(setInterval) != std::string::npos){
        clients[i].write(handleIntervalRoute(url));
      }
      else{
        clients[i].write("Not a route");
      }
      // stop the connection after handling the route and clear the array slot
      clients[i].stop();
      clients[i] = WiFiClient{};
    }
  }

  // After a specified amount of time get each plants humidity
  if(prev_reading == 0 || millis() >= prev_reading + INTERVAL){
      prev_reading = millis();
      try{
        /*
         Reading the sensor data for each plant and in case it's needed watering it
         needs to be executed in a seperate thread in order to not block any incoming
         requests sent to the server
        */
        if(dhtId > 0){
          double temperature = dht.readTemperature();
          double humidity = dht.readHumidity();
          pi.sendDhtReading(dhtId, temperature, humidity);
        }
        for(int i = 0; i < plants.size(); i++){
          plants.at(i).setOK(pi.isOK(plants.at(i).getId()));
        }
        std::thread plantHandler(handlePlants, std::ref(readings));
        plantHandler.detach();
      }
      catch(std::exception &e){
        STATUS_LED.off();
        STATUS_LED.on(Color::RED);
        RaspberryPiInterface::log(e.what());
      }
  }
  // if all plants have had their soil moisture read
  if (readings.size() == plants.size()){
    std::vector<int> responseCodes{};
    // go through the moisture readings
    for (int i = 0; i < readings.size(); i++){
      int tries = 0;
      int responseCode;
      // send the reading values to the server
      do{
        if(readingAvgToPercent(readings.at(i).getAverage(),
           plants.at(i).getSensor()) <= plants.at(i).getMinHumidity()){
          responseCode = pi.sendMoistureReading(readings.at(i), plants.at(i).getId(), true);
        }
        else{
          responseCode = pi.sendMoistureReading(readings.at(i), plants.at(i).getId(), false);
        }
        tries ++;
      }
      // if it hasn't worked try again 
      while(responseCode != 200 && tries < MAX_TRIES);
    }
    readings.clear();
  }
}

double readingAvgToPercent(double avg, MoistureSensor sensor){
  double lowest = sensor.getLowest();
  double highest = sensor.getHighest();
  return 100 * (1 - ((avg - lowest) / (highest - lowest)));
}

// Pass by value for plants because the sensor pin or the reading time/length might
// be changed while handling the sensor readings which we dont want
void handlePlants(std::vector<Reading> &readings){
  STATUS_LED.off();
  STATUS_LED.on(Color::BLUE);
  for (int i = 0; i < plants.size(); ++i)
  {
    Plant plant = plants.at(i);
    Reading r = plant.getReading();
    if (plant.isOK() && plant.getHumidity(r) <= plant.getMinHumidity())
    {
      plant.water();
    }
    readings.push_back(r);
  }
  STATUS_LED.off();
  STATUS_LED.on(Color::GREEN);
}

/**
 * @brief Parse the JSON response from the Pi when requesting the sensors
 * 
 * @param response return value of the pi.getSensors method
 * @return std::vector<Sensor> vector containing the instantiated Sensor objects
 */
std::vector<Plant> parsePlantResponse(std::string response, int size){
    std::vector<Plant> plants{};
    // deserialize json response
    DynamicJsonDocument json(size);
    DeserializationError err = deserializeJson(json, response);
    if(err){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);
      RaspberryPiInterface::log(err.c_str());
    }
    // loop through each plant in the response
    JsonArray plantArray = json.as<JsonArray>();
    for(int i = 0; i < plantArray.size(); ++i){
        // initialize the values needed for each plant constructor from the 
        // json response
        const int valvePin = json[i]["valve_pin"];
        Relay valveRelay{valvePin};
        Valve valve{valveRelay};

        int sensorId = json[i]["sensor_id"];
        int sensorPin = json[i]["MoistureSensor"]["pin"];
        double lowestReading = json[i]["MoistureSensor"]["lowest_reading"].as<double>();
        double highestReading = json[i]["MoistureSensor"]["highest_reading"].as<double>();
        MoistureSensor sensor{sensorId, sensorPin, lowestReading, highestReading};

        const int plantId = json[i]["id"];
        const char* name = json[i]["name"];
        const double minHumidity = json[i]["min_humidity"].as<double>();
        const unsigned long readingTime = json[i]["reading_time"];
        const unsigned long readingLength = json[i]["reading_length"];
        const unsigned long wateringTime = json[i]["watering_time"];

        const int pumpPin = json[i]["pump_pin"];
        Relay pumpRelay{pumpPin};
        Pump pump{pumpRelay};

        Plant plant{plantId, name, minHumidity, readingTime, readingLength, wateringTime, sensor, valve, pump};
        plants.push_back(plant);
    }
    return plants;
}

std::vector<size_t> findAll(std::string str, std::string key){
  std::vector<size_t> occurences{};
  for(size_t i = str.find(key); i != std::string::npos; i = str.find(key, i + 1)){
    occurences.push_back(i);
  }
  return occurences;
}

// /Plants/minHumidity/id/minHumidity
const char* handlePlantHumidityRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      double minHumidity = std::stod(url.substr(occurences.at(3) + 1));
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getId() == plant_id){
          plants.at(i).setMinHumidity(minHumidity);
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(const std::exception& e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}
// /Plants/pumpPin/id/pumpPin
const char* handlePlantPumpPinRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      int pump_pin = std::stoi(url.substr(occurences.at(3) + 1));
      Relay r{pump_pin};
      Pump p{r};
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getId() == plant_id){
          plants.at(i).setPump(p);
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}

// /Plants/valvePin/:plantId/:valePin
const char* handlePlantValvePinRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      int valve_pin = std::stoi(url.substr(occurences.at(3) + 1));
      Relay r{valve_pin};
      Valve v{r};
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getId() == plant_id){
          plants.at(i).setValve(v);
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}


// /Plants/moistureSensor/plantId/sensorId/sensorPin
const char* handlePlantMoistureSensorRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 5){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      int sensor_id = std::stoi(url.substr(occurences.at(3) + 1, occurences.at(4)));
      int sensor_pin = std::stoi(url.substr(occurences.at(4) + 1));

      MoistureSensor s{sensor_id, sensor_pin};
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getId() == plant_id){
          plants.at(i).setSensor(s);
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}


// /Plants/readingTime/id/readingTime
const char* handlePlantReadingTimeRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      unsigned long time = std::stoi(url.substr(occurences.at(3) + 1));
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getId() == plant_id){
          plants.at(i).setReadingTime(time);
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}

// /Plants/readingLength/id/readingLength
const char* handlePlantReadingLengthRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      unsigned long length = std::stoi(url.substr(occurences.at(3) + 1));
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getId() == plant_id){
          plants.at(i).setReadingLength(length);
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}

// /Plants/wateringTime/:id/:millis
const char* handlePlantWateringTimeRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int id = std::stoi(url.substr(occurences.at(2) + 1, occurences.at(3)));
      unsigned long millis = std::stoul(url.substr(occurences.at(3) + 1));
      int plantIndex = findPlant(id);
      if(plantIndex >= 0){
        plants.at(plantIndex).setWateringTime(millis);
        return "OK";
      }
      return "Nothing changed";
    }
    catch(std::exception &e){
      return e.what();
    }
  }
  return "Faulty request";
}

// /MoistureSensors/Calibrate/id/:highest||lowest
const char* handleMoistureSensorCalibrateRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 4){
    try{
      int plant_id = std::stoi(url.substr(occurences.at(2) + 1));
      std::string valueToCalibrate = url.substr(occurences.at(3) + 1);
      std::string highest = "highest";
      for(int i = 0; i < plants.size(); i++){
        if(plants.at(i).getSensor().getId() == plant_id){
          if(valueToCalibrate.compare(highest) == 0){
            plants.at(i).getSensor().calibrateHighest(pi);
          }
          else{
            plants.at(i).getSensor().calibrateLowest(pi);
          }
          return "OK";
        }
      }
      return "nothing changed";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}

// /Interval/:millis
const char* handleIntervalRoute(std::string url){
  std::vector<size_t> occurences = findAll(url, "/");
  if(occurences.size() == 2){
    try{
      unsigned long millis = std::stoul(url.substr(occurences.at(1) + 1));
      INTERVAL = millis >= MIN_INTERVALL ? millis : MIN_INTERVALL;
      return "OK";
    }
    catch(std::exception &e){
      STATUS_LED.off();
      STATUS_LED.on(Color::RED);

      return e.what();
    }
  }
  return "Faulty request";
}


int findPlant(int id){
  int index = -1;
  for(int i = 0; i < plants.size(); i++){
    if(plants.at(i).getId() == id){
      return i;
    }
  }
  return index;
}