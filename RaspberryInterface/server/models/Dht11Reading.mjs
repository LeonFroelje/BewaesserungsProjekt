"use strict";
import { sequelize } from "../bewaesserungsAPIs.mjs";
import {DataTypes, Model} from "sequelize";



class Dht11Reading extends Model{}
Dht11Reading.init({
    sensor_id : {
        type: DataTypes.INTEGER,
        allowNull : false
    },

    humidity : {
        type : DataTypes.INTEGER,
        allowNull : false
    },

    temperature : {
        type : DataTypes.INTEGER,
        allowNull : false
    }    
},{ sequelize,
    modelName : "Dht11Reading",
    timestamps : true,
    updatedAt : false,
    createdAt : "created_at",
})

export {Dht11Reading};