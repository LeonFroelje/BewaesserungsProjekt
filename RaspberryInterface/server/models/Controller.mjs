"use strict";
import {sequelize} from "../bewaesserungsAPIs.mjs";
import {DataTypes, Model} from "sequelize";


class Controller extends Model{};

Controller.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // 30 min
        defaultValue: 1000*60*30
    },

    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {sequelize, 
    modelName : "Controllers",
    timestamps : true,
    updatedAt : true,
    updatedAt: "updated_at",
    createdAt : "created_at",
    }
);

export { Controller };