'use strict';

import express, { urlencoded } from "express";
import fs from "fs";
import date from "date-and-time";
import { log } from "../log.mjs";
import { Room } from '../models/Room.mjs';
import { Controller } from '../models/Controller.mjs';
import { Dht11 } from '../models/Dht11.mjs';
import { Plant } from '../models/Plant.mjs';
import { MoistureSensor } from '../models/MoistureSensor.mjs';
import { Dht11Reading } from "../models/Dht11Reading.mjs";
import { MoistureReading } from "../models/MoistureReading.mjs";
import path from "path";
import { __filename, __dirname } from "../bewaesserungsAPIs.mjs";


let WebsiteApi = express.Router();

WebsiteApi.get("/index/load", (req, res) => {
    let responseData = {
        rooms: []
    }
    // find all rooms
    Room.findAll()
    .then(rooms => {
        // if there are any rooms
        if(rooms.length > 0){
            // go through each of them
            rooms.forEach(room => {
                // add the room's data to the response
                responseData.rooms.push({
                    "id": room.id,
                    "name": room.name,
                    "controllers" : []
                })
                // find all the controllers that belong to the room
                let resControllers = []
                Controller.findAll({
                    attributes: ["id", "name", "interval", "address"],
                    where: {
                        room_id: room.id
                    }
                })
                .then(controllers => {
                    // if there are any controllers
                    if(controllers.length > 0){
                        // go through each of the controllers
                        controllers.forEach(controller => {
                            let DHT = {};
                            let resPlants = [];

                            // find the controller's temperature & humidity Sensor  
                            Dht11.findOne({
                                attributes: ["id", "pin"],
                                where: {
                                    controller_id: controller.id
                                }
                            })
                            .then(dht => {
                                // if there's a DHT sensor for the controller, save it
                                if(dht){
                                    DHT["id"] = dht.id;
                                    DHT["pin"] = dht.pin;
                                }
                            })
                            // find all the Plants that the controller takes care of
                            .then(() => {
                                Plant.findAll({
                                where: {
                                    controller_id: controller.id
                                },
                                attributes: ["id", "name", "min_humidity", "pump_pin",
                                            "valve_pin", "reading_time", "reading_length", 
                                            "watering_time"],
                                // also include each plant's moisture sensor
                                include: MoistureSensor
                                })
                                .then(plants => {
                                    // if there are any plants
                                    if(plants.length > 0){
                                        // go through each plant
                                        plants.forEach(plant => {
                                            // extract the data and save it in an object
                                            const p = {
                                                id: plant.id,
                                                name: plant.name,
                                                minHumidity: plant.min_humidity,
                                                pumpPin: plant.pump_pin,
                                                valvePin: plant.valve_pin,
                                                readingTime: plant.reading_time,
                                                readingLength: plant.reading_length,
                                                wateringTime: plant.watering_time,
                                                // also save the moisture sensor
                                                MoistureSensor: {
                                                    id: plant.MoistureSensor.id,
                                                    pin: plant.MoistureSensor.pin,
                                                    lowestReading: plant.MoistureSensor.lowest_reading,
                                                    highestReading: plant.MoistureSensor.highest_reading
                                                }
                                            };
                                            // append it to the plants array
                                            resPlants.push(p);
                                        });
                                        // append the controller data to the controllers array
                                        resControllers.push({
                                            id: controller.id,
                                            name: controller.name,
                                            intervall: controller.intervall,
                                            address: controller.address,
                                            dht11: DHT,
                                            plants: resPlants
                                        })    
                                    }
                                })
                                .then(() => {
                                    responseData.rooms.find(r => r.id === room.id).controllers = resControllers;
                                })
                                .then(() => {
                                    res.json(responseData);
                                })                            
                                .catch(err => {
                                    log(err);
                                    res.status(500);
                                    res.send();
                                })
                            })
                            .catch(err => {
                                log(err);
                                res.status(500);
                                res.send();
                            })
                        }
                    )}

                })
                .catch(err => {
                    log(err);
                    res.status(500);
                    res.send()
                })
            })
        }
    })
    .catch(err => {
        log(err);
        res.status(500);
        res.send();
    })
})


WebsiteApi.get("/Home/Datasets/DHT11/:controllerName", (req, res) => {
    const controllerName = req.params.controllerName;

    Controller.findOne({
        where: {
            name: controllerName
        }
    })
    .then(controller => {
        if (controller) {
            Dht11.findOne({
                where: {
                    controller_id: controller.id
                }
            })
            .then(dht => {
                if (dht) {
                    Dht11Reading.findAll({
                        attributes: ["humidity", "temperature", "created_at"],
                        where: {
                            sensor_id: dht.id
                        }
                    })
                    .then(data => {
                        const labels = data.map(data => {
                            return date.format(new Date(data.created_at), "YYYY-MM-DD HH:mm");
                        })
                        const humidities = data.map(data => {
                            return data.humidity;
                        }) 
                        const temperatures = data.map(data => {
                            return data.temperature;
                        })
                        res.status(200);
                        res.send({
                            labels: labels,
                            humidities: humidities,
                            temperatures: temperatures
                        });
                    })
                    .catch(err => {
                        log(err);
                        res.status(500);
                        res.send();
                    })
                }
                else {
                    res.status(404)
                    res.send();
                }
            })
            .catch(err => {
                log(err);
                res.status(500);
                res.send();
            })
        }
        else {
            res.status(404);
            res.send();
        }
    })
    .catch(controller_err => {
        log(controller_err);
        res.status(500);
        res.send();
    })
})

WebsiteApi.get("/Home/Datasets/Plants/:plantId", (req, res) => {
    const plantId = req.params.plantId;
    let labels;
    let averages;
    let watered;
    if(Number.isInteger(parseInt(plantId))){
        MoistureReading.findAll({
            attributes: ["min", "max", "avg", "watered", "created_at"],
            where: {
                plant_id: plantId
            }
        })
        .then(MoistureReadings => {
            labels = MoistureReadings.map(reading => {
                return date.format(new Date(reading.created_at), "YYYY-MM-DD HH:mm");
            });
            averages = MoistureReadings.map(reading => {
                return reading.avg;
            });
            watered = MoistureReadings.map(reading => {
                return reading.watered;
            });
        })
        .then(() => {
            res.send({
                labels: labels,
                averages: averages,
                wasWatered: watered
            });
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send();
        })
    }
})

WebsiteApi.get("/warnings", (req, res) => {
    let newServerLogs;
    let newEspLogs;
    fs.readdir(path.join(__dirname, "log", "server", "unseen"), (err, files) => {
        if(err){
            log(err);
        }
        else{
            newServerLogs = files;
        }
    });

    fs.readdir(path.join(__dirname, "log", "esp", "unseen"), (err, files) => {
        if(err){
            log(err);
        }
        else{
            newEspLogs = files;
        }
    });
    
    
})

export default WebsiteApi