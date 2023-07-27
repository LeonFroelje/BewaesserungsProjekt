"use strict";
import {sequelize} from "../bewaesserungsAPIs.mjs";
import {DataTypes, Model} from "sequelize";


class Dht11 extends Model{};

Dht11.init({
    id: {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true 
    },

    pin: {
        type:DataTypes.INTEGER,
        defaultValue: -1
    },

    controller_id : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    
}, { sequelize, modelName: 'Dht11',
    tableName : 'Dht11s',
    timestamps : true,
    createdAt : "created_at",
    updatedAt : "updated_at"
});


export {Dht11};