import { Component } from "react";
import styles from "../../styles/component_styles/Plants/PlantsContainer.module.css";
import PlantContainer from "./PlantContainer";


export default class PlantsContainer extends Component{
    render(){
        const plantContainers = this.props.plants.map(plant => {
            return <PlantContainer key={plant.name} plant={plant}></PlantContainer>
        });
        return(
            <div className={styles.container}>
                {plantContainers}
            </div>
        );
    }
}