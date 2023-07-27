import { Component } from "react";
import styles from "../../styles/component_styles/Plants/PlantContainer.module.css";
import Plant from "./Plant";


export default class PlantContainer extends Component{
    render(){
        return(
            <div className={styles.container}>
                <Plant name={this.props.plant.name} room={this.props.plant.room}
                    minHumidity={this.props.plant.minHumidity} sensor={this.props.plant.sensor}
                    valvePin={this.props.plant.valvePin} pumpPin={this.props.plant.pumpPin}></Plant>
            </div>
        )
    }
}