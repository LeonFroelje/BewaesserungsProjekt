'use strict';
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../bewaesserungsAPIs.mjs";


class Room extends Model{};

Model.init({
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },

    name : {
        type : DataTypes.STRING,
        allowNull : false
    }
}, {sequelize,
    modelName : "Room",
    timestamps : true,
    createdAt : "created_at",
    updatedAt : "updated_at"});


export {Room};