'use strict';
import {sequelize} from "../bewaesserungsAPIs.mjs";
import { Model, DataTypes } from "sequelize";

class MoistureSensor extends Model{}  

MoistureSensor.init({
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },

    pin : {
        type : DataTypes.INTEGER
    },

    lowest_reading : {
        type : DataTypes.DOUBLE,
        allowNull : false,
        defaultValue: 2000
    },

    highest_reading : {
        type : DataTypes.DOUBLE,
        allowNull : false,
        defaultValue: 4000
    },

}, {sequelize,
    modelName : "MoistureSensor",
    timestamps : true,
    createdAt : "created_at",
    updatedAt : "updated_at"
})

export {MoistureSensor};