'use strict';
import {log} from "../log.mjs";
import {sequelize} from "../db.mjs";
import { Model, DataTypes } from "sequelize";


class Plant extends Model{};

Plant.init({
    
    id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },

    name : {
        type : DataTypes.STRING,
        allowNull : false
    },

    controller_id: {
        type:DataTypes.INTEGER,
    },

    min_humidity : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    sensor_id : {
        type : DataTypes.INTEGER
    },

    pump_pin : {
        type : DataTypes.INTEGER
    },

    valve_pin : {
        type : DataTypes.INTEGER
    },

    reading_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // 30 sec
        defaultValue: 30000
    },

    reading_length: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },

    watering_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3000
    }

}, {sequelize,
    modelName : "Plant",
    timestamps : true,
    createdAt : "created_at",
    updatedAt : "updated_at"})

export{ Plant }