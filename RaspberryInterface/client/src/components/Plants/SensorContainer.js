import { Component } from "react";
import styles from "../../styles/component_styles/Plants/SensorContainer.module.css";

export default class SensorContainer extends Component{
    render(){
        return(
            <>
                <div className={styles.pinContainer}>{this.props.pin}</div>
                <div className={styles.readingContainer}>{this.props.lowestReading}
                {this.props.highestReading}</div>
            </>
        )
    }
}