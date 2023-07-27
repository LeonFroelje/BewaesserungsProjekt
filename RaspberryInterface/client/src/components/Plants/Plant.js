import { Component } from "react";
import styles from "../../styles/component_styles/Plants/Plant.module.css";
import SensorContainer from "./SensorContainer";

export default class Plant extends Component{
    render(){
        return (
            <div className={styles.backgroundImage}>
               <div className={styles.nameContainer}>{this.props.name}</div>
               <div className={styles.roomContainer}>{this.props.room}</div>
               <div className={styles.humContainer}>{this.props.minHumidity}</div>
               <SensorContainer sensor={this.props.sensor}></SensorContainer>
               <div className={styles.pinContainer}>{this.props.valvePin}{this.props.pumpPin}</div>
            </div>
        );
    }
}