"use strict";
import path from "path";
import { fileURLToPath } from "url";
import { appendFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function log(str){    
    if(! typeof(str) === String){
        str = String(str);
    }
    let date = new Date(Date.now());
    appendFileSync(path.join(__dirname, "log", "server", `${String(date.getDate())}_${
        String(date.getMonth())}_${String(date.getFullYear())}_.log`),
    str + "\n", err => {
        if(err){
            console.log(err);
        }
    })
}

function espLog(str){
    if(! typeof(str) === String){
        str = String(str);
    }
    let date = new Date(Date.now());
    appendFileSync(path.join(__dirname, "log", "esp", "log.log"),
    Date().toString() +"\t" +  str + "\n", err => {
        if(err){
            log(err);
        }
    })
}

export { log, espLog };