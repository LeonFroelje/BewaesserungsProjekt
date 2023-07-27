'use strict';

import { sequelize } from './db.mjs';
import compression from 'compression';
import helmet from 'helmet';
import express from 'express';
import espApi from './controllers/EspApi.mjs';
import WebsiteApi from "./controllers/WebsiteApi.mjs";
import { } from "./models/Relations.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from "cors";
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// create log folders
if(!existsSync(path.join(__dirname, "log"))){
    mkdirSync(path.join(__dirname, "log"));
    mkdirSync(path.join(__dirname, "log", "server"));
    mkdirSync(path.join(__dirname, "log", "server", "unseen"));
    mkdirSync(path.join(__dirname, "log", "server", "seen"));
}
else if(!existsSync(path.join(__dirname, "log", "server"))){
    mkdirSync(path.join(__dirname, "log", "server"));
    mkdirSync(path.join(__dirname, "log", "server", "unseen"));
    mkdirSync(path.join(__dirname, "log", "server", "seen"));
}
else if(!existsSync(path.join(__dirname, "log", "server", "unseen"))){
    mkdirSync(path.join(__dirname, "log", "server", "unseen"));
    if(!existsSync(path.join(__dirname, "log", "server", "seen"))){
        mkdirSync(path.join(__dirname, "log", "server", "seen"));
    }
}
else if(!existsSync(path.join(__dirname, "log", "server", "seen"))){
    mkdirSync(path.join(__dirname, "log", "server", "seen"));
    if(!existsSync(path.join(__dirname, "log", "server", "unseen"))){
        mkdirSync(path.join(__dirname, "log", "server", "unseen"));
    }
}


if(!existsSync(path.join(__dirname, "log"))){
    mkdirSync(path.join(__dirname, "log"));
    mkdirSync(path.join(__dirname, "log", "esp"));
    mkdirSync(path.join(__dirname, "log", "esp", "unseen"));
    mkdirSync(path.join(__dirname, "log", "esp", "seen"));
}
else if(!existsSync(path.join(__dirname, "log", "esp"))){
    mkdirSync(path.join(__dirname, "log", "esp"));
    mkdirSync(path.join(__dirname, "log", "esp", "unseen"));
    mkdirSync(path.join(__dirname, "log", "esp", "seen"));
}
else if(!existsSync(path.join(__dirname, "log", "esp", "unseen"))){
    mkdirSync(path.join(__dirname, "log", "esp", "unseen"));
    if(!existsSync(path.join(__dirname, "log", "esp", "seen"))){
        mkdirSync(path.join(__dirname, "log", "esp", "seen"));
    }
}
else if(!existsSync(path.join(__dirname, "log", "esp", "seen"))){
    mkdirSync(path.join(__dirname, "log", "esp", "seen"));
    if(!existsSync(path.join(__dirname, "log", "esp", "unseen"))){
        mkdirSync(path.join(__dirname, "log", "esp", "unseen"));
    }
}


const app = express();
const port = 5000;

app.use(cors({
    origin: "*"
}));

app.use(compression());
app.use(helmet());

sequelize.sync({force: false});

app.listen(port, () => {
    console.log("kek");
});

app.set("view engine", "ejs");

app.use("/EspApi", espApi);
app.use("/WebsiteApi", WebsiteApi);

export {app, sequelize, __filename, __dirname };