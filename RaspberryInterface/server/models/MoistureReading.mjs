import { Model, DataTypes} from "sequelize";
import {sequelize} from "../bewaesserungsAPIs.mjs";


class MoistureReading extends Model{}
MoistureReading.init({   
    plant_id : {
        type : DataTypes.INTEGER,
        allowNull : false
    },

    min : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    max : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    avg : {
        type : DataTypes.DOUBLE,
        allowNull : false
    },

    watered: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {sequelize,
    modelName : "MoistureReading",
    timestamps : true,
    createdAt : "created_at",
    updatedAt : false
})

export {MoistureReading};