import { Component } from "react";
import PlantsContainer from "../components/Plants/PlantsContainer";
import styles from "../styles/routeStyles/config.module.css";
import { serverContext } from "./indexRoute";


export default class Config extends Component{
    render(){
        return(
        <div className={styles.Container}>
            <PlantsContainer plants={this.context.rooms[0].controllers[0].plants}>

            </PlantsContainer>
        </div>
        )
    }
}

Config.contextType = serverContext;