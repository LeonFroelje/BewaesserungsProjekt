"use strict"; 
import { Model, DataTypes } from "sequelize";
import {sequelize} from "../bewaesserungsAPIs.mjs";

class Weather extends Model{};

Weather.init({
    description : {
        type : DataTypes.STRING,
        allowNull : false
    },

    humidity : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    temperature : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    feels_like : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    cloudiness : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    rain : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    snow : {
        type : DataTypes.DOUBLE,
        allowNull : false
    }
}, {sequelize,
    modelName : "Weather",
    tableName : "Weather",
    timestamps : true,
    createdAt : "created_at",
    updatedAt : false});


export {Weather};