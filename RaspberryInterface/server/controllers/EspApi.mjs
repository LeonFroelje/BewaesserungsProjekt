'use strict';

import express, { urlencoded } from "express";
import { QueryTypes, where } from "sequelize";
import { sequelize } from '../db.mjs';
import { espLog, log } from "../log.mjs";
import { Dht11 } from "../models/Dht11.mjs";
import { Dht11Reading } from "../models/Dht11Reading.mjs";
import { MoistureReading } from "../models/MoistureReading.mjs";
import { MoistureSensor } from "../models/MoistureSensor.mjs";
import { Plant } from "../models/Plant.mjs";
import { Room } from "../models/Room.mjs";
import { Weather } from "../models/Weather.mjs";
import { Controller } from "../models/Controller.mjs";

let espApi = express.Router();

espApi.use(express.text());
espApi.use(express.urlencoded());
espApi.use(express.json());

/*
Room.create({
    "name" : "BremenZimmer"
});

Controller.create({
    name: "Fensterbank",
    room_id: 1,
    address: "192.168.178.59"
});

MoistureSensor.create({
    pin : 36,
    lowest_reading : 2378,
    highest_reading : 4095,
});

MoistureSensor.create({
    pin : 39,
    lowest_reading : 2285,
    highest_reading : 4095,
});

MoistureSensor.create({
    pin : 34,
    lowest_reading : 2333,
    highest_reading : 4095,
});

MoistureSensor.create({
    pin : 35,
    lowest_reading : 2406,
    highest_reading : 4095,
});

MoistureSensor.create({
    pin : 32,
    lowest_reading : 718,
    highest_reading : 2689,
});


Plant.create({
    name : "Venusfliegenfalle",
    room_id : 1,
    controller_id: 1,
    min_humidity : 70,
    sensor_id : 1,
    pump_pin : 15,
    valve_pin: 2
});

Plant.create({
    name : "Sarracenia",
    room_id : 1,
    controller_id: 1,
    min_humidity : 70,
    sensor_id : 2,
    pump_pin : 15,
    valve_pin: 0
});

Plant.create({
    name : "Nepenthes",
    room_id : 1,
    controller_id: 1,
    min_humidity : 70,
    sensor_id : 3,
    pump_pin : 15,
    valve_pin: 4
});

Plant.create({
    name : "Sonnentau",
    room_id : 1,
    controller_id: 1,
    min_humidity : 70,
    sensor_id : 4,
    pump_pin : 15,
    valve_pin: 16
});

Plant.create({
    name : "Geldbaum",
    room_id : 1,
    controller_id: 1,
    min_humidity : 30,
    sensor_id : 5,
    pump_pin : 15,
    valve_pin: 17
});

Dht11.create({
    room_id: 1,
    controller_id: 1,
    pin: 33
});
*/

espApi.get("/ping", (req, res) => {
    res.status(200).send();
})

espApi.post("/log", (req, res) => {
    let msg = req.body;
    try{
        espLog(msg);
        res.status(200);
        res.send();
    }
    catch(err){
        log(err);
        res.status(500);
        res.send();
    }
})

espApi.get("/Interval/:controllerId", (req, res) => {
    if(Number.isInteger(parseInt(req.params.controllerId))){
        Controller.findByPk(req.params.controllerId)
        .then(controller => {
            if(controller){
                let interval = controller.interval;
                res.status(200);
                res.send(interval.toString());
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send();
        })
    }
    else{
        res.status(400);
        res.send();
    }
})

espApi.route("/Plants/:controllerId")
    .get((req, res) => {
        if(Number.isInteger(parseInt(req.params.controllerId))){
            // replace with raw query because it's easier that way
            Plant.findAll({
                attributes: ["id", "name", "min_humidity", "sensor_id", "pump_pin", "valve_pin",
                "reading_time", "reading_length", "watering_time"],
                include : [{model: MoistureSensor, attributes: ["pin", "lowest_reading", "highest_reading"]}],
                where: {
                    controller_id: req.params.controllerId
                }
            })
            .then(data => {
                if(data.length > 0){
                    res.status(200);
                    res.send(JSON.stringify(data));
                }
                else{
                    res.status(404);
                    res.send();
                }
            })
            .catch(err => {
                log(err);
                res.status(500);
                res.send();
            })
        }
        else{
            res.status(400);
            res.send();
        }
    })
    .post((req, res) => {})


espApi.get("/Plants/Count/:controllerId", (req, res) =>{
    if(Number.isInteger(parseInt(req.params.controllerId))){
        Plant.findAll({
            attributes:[
                [sequelize.fn(`COUNT`, sequelize.col("controller_id"))]
            ],
            where:{
                controller_id: req.params.controllerId
            }
        })
        .then(count => {
            if(count > 0){
                res.status(200);
                res.send(count.toString());
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send()
        })
    }
    else{
        res.status(400);
        res.send();
    }
})


espApi.get("/Plants/isOk/:id", (req, res) => {
    if(Number.isInteger(parseInt(req.params.id))){
        MoistureReading.findOne({
            attributes: [
                "created_at"
            ],
            where:{
                plant_id: req.params.id,
                watered: true
            },
            order:[
                ["created_at", "DESC"]
            ]
        })
        .then(timestamp => {
            if(timestamp){
                console.log(timestamp)
                res.status(200);
                timestamp = Date.parse(timestamp)
                let now = new Date(); 
                // is it nighttime?
                if(now.getHours() >= 22 || now.getHours() <= 7){
                    res.status(405);
                    res.send();
                }
                // was the plant watered too recently?
                else if(now - timestamp <= 4.32*10**7){
                    res.status(405);
                    res.send();
                }
                res.send()
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send();
        })
    }
})


espApi.route("/MoistureSensors/CalibrationValues/:id")
    .get((req, res) => {
        if(Number.isInteger(parseInt(req.params.id))){
            MoistureSensor.findByPk(req.params.id)
            .then(data => {
                if(data){
                    res.status(200);
                    res.send({
                        lowest_reading : data.lowest_reading,
                        highest_reading : data.highest_reading
                    });
                }
                else{
                    res.status(404);
                    res.send();
                }
            })
            .catch(err => {
                log(err);
                res.status(500).send();
            });
        }
        else{
            res.status(400);
            res.send();
        }
    })



espApi.get("/MoistureSensors/CalibrationValues/:id/:which/:value", (req, res) => {
    let which = req.params.which;
    let value = req.params.value;
    let id = req.params.id;
    if(Number.isInteger(parseInt(id)) && which.match(/(lowest)|(highest)/g) != null && !isNaN(parseFloat(value))){
        MoistureSensor.findByPk(req.params.id)
        .then(sensor => {
            if(sensor){
                sensor[req.params.which] = req.params.value;
                sensor.save()
                .then(() => {
                    res.status(200);
                    res.send();
                })
                .catch(err => {
                    log(err);
                    res.status(500);
                    res.send();
                })
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send();
        })
    }
    else{
        res.status(400);
        res.send();
    }
})


espApi.get("/Plants/MoistureReadings/:plant_id/:min/:max/:avg/:watered", (req, res) => {
    let valueToPercent = (value) => {
        // Math.round because of decimal places
        return Math.round(100 * (100 * (1 - ((value - lowest) / (highest - lowest))))) / 100;
    }
    const max = req.params.max;
    const min = req.params.min;
    const avg = req.params.avg;
    const watered = req.params.watered;
    let lowest;
    let highest;
    if(Number.isInteger(parseInt(req.params.plant_id)) && !(isNaN(parseFloat(max)) 
    || isNaN(parseFloat(min)) || isNaN(parseFloat(avg)))
    && (watered === "true" || watered === "false")){
        Plant.findByPk(req.params.plant_id,{
            include: MoistureSensor
        })
        .then(plant => {
            if(plant){
                lowest = plant.MoistureSensor.lowest_reading;
                highest = plant.MoistureSensor.highest_reading;
                if(min < lowest){
                    plant.MoistureSensor.update({lowest_reading: min});
                    lowest = min;
                }
                if(max > highest){
                    plant.MoistureSensor.update({highest_reading: max});
                    highest = max;
                }
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .then(() => {
            // max and min are swapped, because the minimum reading value of
            // the sensor corresponds to the highest percentage of moisture
            // since the measured capacity goes down as the soil moisture rises
            MoistureReading.create({
                plant_id : req.params.plant_id,
                max : valueToPercent(min),
                min : valueToPercent(max),
                avg : valueToPercent(avg),
                watered: watered === "true" ? true : false
            })
            .then(result => {
                res.status(200);
                res.send();
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
    else{
        res.status(400);
        res.send();
    }    
})


espApi.get("/Dht11s/:controllerId", (req, res) => {
    if(Number.isInteger(parseInt(req.params.controllerId))){
        sequelize.query(`SELECT Dht11s.id, Dht11s.pin FROM Dht11s JOIN Controllers ON
         Dht11s.controller_id = Controllers.id WHERE Controllers.id = ?`,
        {
            replacements: [req.params.controllerId],
            type: QueryTypes.SELECT
        })
        .then(data => {
            if(data.length > 0){
                res.status(200);
                res.send(`${data.at(0).id},${data.at(0).pin}`);
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send();
        })
    }
    else{
        res.status(400);
        res.send();
    }
})


espApi.get("/Dht11s/Readings/:id/:temperature/:humidity", (req, res) => {
    if(Number.isInteger(parseInt(req.params.id)) && !(isNaN(parseFloat(req.params.temperature))
     || isNaN(parseFloat(req.params.humidity)))){
        Dht11.findAll({
            attributes: ["id"],
            where:{
                id: req.params.id
            }
        })
        .then(dht => {
            if(dht.length > 0){
                Dht11Reading.create({
                    sensor_id: req.params.id,
                    temperature: req.params.temperature,
                    humidity: req.params.humidity
                })
                .then(() => {
                    res.status(200);
                    res.send();
                })
                .catch(err => {
                    log(err);
                    res.status(500);
                    res.send();
                })
            }
            else{
                res.status(404);
                res.send();
            }
        })
        .catch(err => {
            log(err);
            res.status(500);
            res.send();
        })
    }
    else{
        res.status(400);
        res.send();
    }
})


export default espApi;