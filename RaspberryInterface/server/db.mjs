'use strict';
import { Sequelize } from "sequelize";
import fs from "fs";


let db_data = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
const sequelize = new Sequelize(db_data);

export { sequelize };