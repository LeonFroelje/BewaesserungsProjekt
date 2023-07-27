import { Dht11 } from "./Dht11.mjs";
import { Dht11Reading } from "./Dht11Reading.mjs";
import { MoistureReading } from "./MoistureReading.mjs";
import { MoistureSensor } from "./MoistureSensor.mjs";
import { Plant } from "./Plant.mjs";
import { Room } from "./Room.mjs";
import { Controller } from "./Controller.mjs"


Dht11Reading.belongsTo(Dht11, {
    foreignKey : "sensor_id"
});
Dht11.hasMany(Dht11Reading, {
    foreignKey : "sensor_id",
});


MoistureReading.belongsTo(Plant, {
    foreignKey : "plant_id"
});
Plant.hasMany(MoistureReading, {
    foreignKey : "plant_id",
});


Plant.belongsTo(MoistureSensor, {
    foreignKey : "sensor_id"
});
MoistureSensor.hasMany(Plant, {
    foreignKey : "sensor_id"
});


Controller.belongsTo(Room, {
    foreignKey: "room_id"
});

Room.hasMany(Controller, {
    foreignKey: "room_id"
});


Plant.belongsTo(Controller, {
    foreignKey: "controller_id"
});

Controller.hasMany(Plant, {
    foreignKey: "controller_id"
});


Controller.hasOne(Dht11, {
    foreignKey: "controller_id"
});

Dht11.belongsTo(Controller, {
    foreignKey: "controller_id"
});
